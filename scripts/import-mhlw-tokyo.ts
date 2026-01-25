import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TOKYO_WARDS = [
  '千代田区', '中央区', '港区', '新宿区', '文京区',
  '台東区', '墨田区', '江東区', '品川区', '目黒区',
  '大田区', '世田谷区', '渋谷区', '中野区', '杉並区',
  '豊島区', '北区', '荒川区', '板橋区', '練馬区',
  '足立区', '葛飾区', '江戸川区'
]

interface FacilityRecord {
  ID: string
  正式名称?: string
  名称?: string
  所在地: string
  '所在地座標（緯度）': string
  '所在地座標（経度）': string
  電話番号?: string
  [key: string]: string | undefined
}

interface HoursRecord {
  ID: string
  診療科目名?: string
  診療科名?: string
  診療時間帯?: string
  月_診療開始時間?: string
  月_診療終了時間?: string
  火_診療終了時間?: string
  水_診療終了時間?: string
  木_診療終了時間?: string
  金_診療終了時間?: string
  土_診療開始時間?: string
  日_診療開始時間?: string
}

function extractWard(address: string): string | null {
  if (!address.startsWith('東京都')) {
    return null
  }
  for (const ward of TOKYO_WARDS) {
    if (address.includes(ward)) {
      return ward
    }
  }
  return null
}

function isTokyo23Ward(address: string): boolean {
  return extractWard(address) !== null
}

function hasNightService(row: HoursRecord): boolean {
  const times = [
    row.月_診療終了時間,
    row.火_診療終了時間,
    row.水_診療終了時間,
    row.木_診療終了時間,
    row.金_診療終了時間,
  ]
  return times.some((time) => {
    if (!time) return false
    const hour = parseInt(time.split(':')[0])
    return hour >= 19
  })
}

function hasWeekendService(row: HoursRecord): boolean {
  return !!(row.土_診療開始時間 || row.日_診療開始時間)
}

function readCsvFile(filePath: string): any[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️ ファイルが見つかりません: ${path.basename(filePath)}`)
    return []
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  try {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relaxColumnCount: true,
    })
  } catch (error) {
    console.error(`  ❌ CSVパースエラー: ${path.basename(filePath)}`)
    return []
  }
}

async function importMhlwTokyo() {
  console.log('📥 厚労省オープンデータから東京23区データをインポート\n')

  const csvDir = path.join(process.cwd(), 'data', 'mhlw', 'csv')

  if (!fs.existsSync(csvDir)) {
    console.error('❌ CSVディレクトリが見つかりません')
    console.error('   先に npm run fetch:mhlw を実行してください')
    process.exit(1)
  }

  const csvFiles = fs.readdirSync(csvDir).filter((f) => f.endsWith('.csv'))
  console.log(`CSVファイル数: ${csvFiles.length}件\n`)

  await prisma.department.deleteMany({})
  await prisma.medicalFacility.deleteMany({})
  await prisma.districtMedicalScore.deleteMany({})
  console.log('✅ 既存データを削除しました\n')

  const facilityFiles = csvFiles.filter(
    (f) => f.includes('facility') || (f.includes('pharmacy') && !f.includes('hour'))
  )
  const hoursFiles = csvFiles.filter((f) => f.includes('hour') || f.includes('speciality'))

  console.log('=== 施設データの読み込み ===\n')

  const allFacilities: Map<string, { record: FacilityRecord; type: string }> = new Map()

  for (const file of facilityFiles) {
    const filePath = path.join(csvDir, file)
    const records = readCsvFile(filePath) as FacilityRecord[]

    let type = '不明'
    if (file.includes('hospital')) type = '病院'
    else if (file.includes('clinic') && !file.includes('dental')) type = '診療所'
    else if (file.includes('dental')) type = '歯科'
    else if (file.includes('pharmacy')) type = '薬局'

    const tokyoRecords = records.filter((r) => isTokyo23Ward(r.所在地 || ''))
    console.log(`  ${file}: ${tokyoRecords.length}件（東京23区）/ ${records.length}件（全国）`)

    tokyoRecords.forEach((r) => {
      allFacilities.set(r.ID, { record: r, type })
    })
  }

  console.log(`\n東京23区の施設総数: ${allFacilities.size}件\n`)

  console.log('=== 診療時間データの読み込み ===\n')

  const hoursMap: Map<string, HoursRecord[]> = new Map()

  for (const file of hoursFiles) {
    const filePath = path.join(csvDir, file)
    const records = readCsvFile(filePath) as HoursRecord[]

    let count = 0
    for (const r of records) {
      if (allFacilities.has(r.ID)) {
        const existing = hoursMap.get(r.ID) || []
        existing.push(r)
        hoursMap.set(r.ID, existing)
        count++
      }
    }
    console.log(`  ${file}: ${count}件（対象施設）`)
  }

  console.log('\n=== データベースへの登録 ===\n')

  const stats = {
    total: 0,
    byType: new Map<string, number>(),
    byWard: new Map<string, number>(),
    departments: 0,
  }

  for (const [id, { record, type }] of allFacilities.entries()) {
    const lat = parseFloat(record['所在地座標（緯度）'] || '0')
    const lng = parseFloat(record['所在地座標（経度）'] || '0')

    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      continue
    }

    const ward = extractWard(record.所在地 || '')
    if (!ward) continue

    const name = record.正式名称 || record.名称 || '名称不明'

    try {
      const facility = await prisma.medicalFacility.create({
        data: {
          id,
          facilityType: type,
          name,
          postalCode: '',
          address: record.所在地 || '',
          districtName: ward,
          phoneNumber: record.電話番号 || null,
          latitude: lat,
          longitude: lng,
        },
      })

      stats.total++
      stats.byType.set(type, (stats.byType.get(type) || 0) + 1)
      stats.byWard.set(ward, (stats.byWard.get(ward) || 0) + 1)

      const hours = hoursMap.get(id) || []
      const deptMap = new Map<string, HoursRecord[]>()

      for (const h of hours) {
        const deptName = h.診療科目名 || h.診療科名 || ''
        if (deptName) {
          const existing = deptMap.get(deptName) || []
          existing.push(h)
          deptMap.set(deptName, existing)
        }
      }

      for (const [deptName, deptRows] of deptMap.entries()) {
        const hasNight = deptRows.some((r) => hasNightService(r))
        const hasWeekend = deptRows.some((r) => hasWeekendService(r))

        await prisma.department.create({
          data: {
            facilityId: facility.id,
            departmentName: deptName,
            hasNightService: hasNight,
            hasWeekendService: hasWeekend,
            hasHomeVisit: false,
          },
        })
        stats.departments++
      }
    } catch (error: any) {
      if (!error.message.includes('Unique constraint')) {
        console.warn(`  ⚠️ 登録エラー: ${id} - ${error.message}`)
      }
    }
  }

  console.log('\n=== インポート結果 ===\n')
  console.log(`施設総数: ${stats.total}件`)
  console.log(`診療科数: ${stats.departments}件\n`)

  console.log('【施設種別】')
  for (const [type, count] of stats.byType.entries()) {
    console.log(`  ${type}: ${count}件`)
  }

  console.log('\n【区別】')
  for (const ward of TOKYO_WARDS) {
    const count = stats.byWard.get(ward) || 0
    console.log(`  ${ward}: ${count}件`)
  }

  await prisma.$disconnect()
  console.log('\n✅ インポート完了')
  console.log('\n次のステップ:')
  console.log('npm run calculate:scores を実行してスコアを計算してください')
}

importMhlwTokyo().catch((error) => {
  console.error('❌ エラー:', error)
  process.exit(1)
})
