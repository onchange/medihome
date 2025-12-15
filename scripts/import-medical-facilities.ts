import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface FacilityCSV {
  ID: string
  正式名称: string
  所在地: string
  所在地座標緯度: string
  所在地座標経度: string
}

interface DepartmentCSV {
  ID: string
  診療科目名: string
  診療時間帯: string
  月_診療開始時間: string
  月_診療終了時間: string
  火_診療開始時間: string
  火_診療終了時間: string
  水_診療開始時間: string
  水_診療終了時間: string
  木_診療開始時間: string
  木_診療終了時間: string
  金_診療開始時間: string
  金_診療終了時間: string
  土_診療開始時間: string
  土_診療終了時間: string
  日_診療開始時間: string
  日_診療終了時間: string
}

function extractDistrict(address: string): string {
  const match = address.match(/浦安市(.+?)[\d０-９]/)
  if (match) {
    return match[1]
  }
  return '不明'
}

function extractPostalCode(address: string): string {
  const match = address.match(/^(\d{3}-\d{4})/)
  return match ? match[1] : '不明'
}

function hasNightService(row: DepartmentCSV): boolean {
  const times = [
    row.月_診療終了時間,
    row.火_診療終了時間,
    row.水_診療終了時間,
    row.木_診療終了時間,
    row.金_診療終了時間,
  ]
  return times.some(time => {
    if (!time) return false
    const hour = parseInt(time.split(':')[0])
    return hour >= 19
  })
}

function hasWeekendService(row: DepartmentCSV): boolean {
  return !!(row.土_診療開始時間 || row.日_診療開始時間)
}

async function importFacilities() {
  console.log('📥 医療施設データのインポート開始\n')

  const dataDir = path.join(process.cwd(), 'data', 'raw')

  const facilityFiles = [
    { file: 'urayasu_hospitals.csv', type: '病院' },
    { file: 'urayasu_clinics_real.csv', type: '診療所' },
    { file: 'urayasu_dental.csv', type: '歯科' },
    { file: 'urayasu_maternity.csv', type: '助産所' },
    { file: 'urayasu_pharmacy.csv', type: '薬局' },
  ]

  const allFacilities: FacilityCSV[] = []
  const facilityTypes = new Map<string, string>()

  for (const { file, type } of facilityFiles) {
    const filePath = path.join(dataDir, file)
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${file} が見つかりません`)
      continue
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    }) as FacilityCSV[]

    records.forEach(record => {
      facilityTypes.set(record.ID, type)
    })

    allFacilities.push(...records)
    console.log(`✅ ${file}: ${records.length}件`)
  }

  const departmentFilePath = path.join(dataDir, 'urayasu_hours_real.csv')
  let departmentRecords: DepartmentCSV[] = []

  if (fs.existsSync(departmentFilePath)) {
    const content = fs.readFileSync(departmentFilePath, 'utf-8')
    departmentRecords = parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    }) as DepartmentCSV[]
    console.log(`✅ urayasu_hours_real.csv: ${departmentRecords.length}件\n`)
  }

  const departmentsByFacility = new Map<string, DepartmentCSV[]>()
  departmentRecords.forEach(dept => {
    const existing = departmentsByFacility.get(dept.ID) || []
    existing.push(dept)
    departmentsByFacility.set(dept.ID, existing)
  })

  console.log('📊 データベースへの登録開始...\n')

  let facilityCount = 0
  let departmentCount = 0

  for (const record of allFacilities) {
    const lat = parseFloat(record['所在地座標（緯度）'])
    const lng = parseFloat(record['所在地座標（経度）'])

    const name = (record as any).正式名称 || (record as any).名称 || '名称不明'

    if (isNaN(lat) || isNaN(lng)) {
      console.log(`⚠️ 緯度経度が不正: ${record.ID} ${name}`)
      continue
    }

    const districtName = extractDistrict(record.所在地)
    const postalCode = extractPostalCode(record.所在地)
    const facilityType = facilityTypes.get(record.ID) || '不明'

    const facility = await prisma.medicalFacility.create({
      data: {
        id: record.ID,
        facilityType,
        name,
        postalCode,
        address: record.所在地,
        districtName,
        phoneNumber: null,
        latitude: lat,
        longitude: lng,
      },
    })

    facilityCount++

    const departments = departmentsByFacility.get(record.ID) || []
    const departmentMap = new Map<string, DepartmentCSV[]>()

    departments.forEach(dept => {
      const key = dept.診療科目名
      const existing = departmentMap.get(key) || []
      existing.push(dept)
      departmentMap.set(key, existing)
    })

    for (const [deptName, deptRows] of departmentMap.entries()) {
      const hasNight = deptRows.some(row => hasNightService(row))
      const hasWeekend = deptRows.some(row => hasWeekendService(row))

      const timeSlots = deptRows
        .map(row => `時間帯${row.診療時間帯}`)
        .join(', ')

      await prisma.department.create({
        data: {
          facilityId: facility.id,
          departmentName: deptName,
          consultationHours: timeSlots,
          hasNightService: hasNight,
          hasWeekendService: hasWeekend,
          hasHomeVisit: false,
        },
      })

      departmentCount++
    }
  }

  console.log('\n✅ インポート完了')
  console.log(`   施設数: ${facilityCount}件`)
  console.log(`   診療科・時間: ${departmentCount}件`)

  await prisma.$disconnect()
}

importFacilities()
  .catch(error => {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  })
