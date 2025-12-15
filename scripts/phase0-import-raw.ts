import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

async function importRawData() {
  console.log('📊 実データをSQLiteにインポート中...\n')

  const facilityPath = path.join(process.cwd(), 'data', 'raw', 'urayasu_clinics_real.csv')
  const hoursPath = path.join(process.cwd(), 'data', 'raw', 'urayasu_hours_real.csv')

  if (!fs.existsSync(facilityPath) || !fs.existsSync(hoursPath)) {
    console.error('❌ CSVファイルが見つかりません')
    console.error('   先に npm run phase0:download を実行してください')
    process.exit(1)
  }

  const facilityContent = fs.readFileSync(facilityPath, 'utf-8')
  const hoursContent = fs.readFileSync(hoursPath, 'utf-8')

  const facilities = parse(facilityContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  })

  const hours = parse(hoursContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  })

  console.log(`  施設件数: ${facilities.length}件`)
  console.log(`  診療科レコード: ${hours.length}件\n`)

  await prisma.medicalFacilityRaw.deleteMany()

  const hoursMap = new Map<string, any[]>()
  hours.forEach((record: any) => {
    const id = record.ID
    if (!hoursMap.has(id)) {
      hoursMap.set(id, [])
    }
    hoursMap.get(id)!.push(record)
  })

  for (const facility of facilities) {
    const facilityHours = hoursMap.get(facility.ID) || []
    const specialties = [...new Set(facilityHours.map(h => h['診療科目名']))].filter(Boolean)

    const combinedData = {
      ...facility,
      _診療科目リスト: specialties,
      _診療科詳細: facilityHours.length > 0 ? facilityHours : undefined
    }

    await prisma.medicalFacilityRaw.create({
      data: {
        rawData: JSON.stringify(combinedData, null, 2)
      }
    })
  }

  console.log('✅ インポート完了！')
  console.log('📊 Prisma Studioでデータを確認してください:')
  console.log('   npx prisma studio\n')
  console.log('💡 次のステップ:')
  console.log('   npm run phase0:analyze')

  await prisma.$disconnect()
}

importRawData().catch(console.error)
