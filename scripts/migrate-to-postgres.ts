import { PrismaClient as SQLitePrisma } from '@prisma/client'
import { PrismaClient as PostgresPrisma } from '@prisma/client'

const sqlite = new SQLitePrisma({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
})

const postgres = new PostgresPrisma()

async function migrate() {
  console.log('Starting migration from SQLite to PostgreSQL...')

  try {
    // 1. 医療施設データ
    console.log('Migrating MedicalFacility...')
    const facilities = await sqlite.medicalFacility.findMany({
      include: {
        departments: true,
      },
    })

    for (const facility of facilities) {
      const { departments, ...facilityData } = facility
      await postgres.medicalFacility.create({
        data: {
          ...facilityData,
          departments: {
            create: departments.map((d) => ({
              id: d.id,
              departmentName: d.departmentName,
              consultationHours: d.consultationHours,
              hasNightService: d.hasNightService,
              hasWeekendService: d.hasWeekendService,
              hasHomeVisit: d.hasHomeVisit,
            })),
          },
        },
      })
    }
    console.log(`✓ Migrated ${facilities.length} facilities`)

    // 2. 不動産取引データ
    console.log('Migrating RealEstateTransaction...')
    const transactions = await sqlite.realEstateTransaction.findMany()
    await postgres.realEstateTransaction.createMany({
      data: transactions,
    })
    console.log(`✓ Migrated ${transactions.length} transactions`)

    // 3. 地区スコアデータ
    console.log('Migrating DistrictMedicalScore...')
    const scores = await sqlite.districtMedicalScore.findMany()
    await postgres.districtMedicalScore.createMany({
      data: scores,
    })
    console.log(`✓ Migrated ${scores.length} district scores`)

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

migrate()
