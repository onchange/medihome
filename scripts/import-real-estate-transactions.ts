import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Transaction {
  PriceCategory: string
  Type: string
  Region: string
  MunicipalityCode: string
  Prefecture: string
  Municipality: string
  DistrictName: string
  TradePrice: string
  PricePerUnit: string
  FloorPlan: string
  Area: string
  UnitPrice: string
  LandShape: string
  Frontage: string
  TotalFloorArea: string
  BuildingYear: string
  Structure: string
  Use: string
  Purpose: string
  Direction: string
  Classification: string
  Breadth: string
  CityPlanning: string
  CoverageRatio: string
  FloorAreaRatio: string
  Period: string
  Renovation: string
  Remarks: string
  DistrictCode: string
}

interface DataResponse {
  status: string
  data: Transaction[]
}

async function importRealEstateTransactions() {
  console.log('📥 不動産取引データのインポート開始\n')

  const dataDir = path.join(process.cwd(), 'data', 'real-estate')
  const year = '2024'
  const quarters = ['1', '2', '3', '4']

  let totalCount = 0

  for (const quarter of quarters) {
    const filePath = path.join(dataDir, `urayasu_transactions_${year}_q${quarter}.json`)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${filePath} が見つかりません`)
      continue
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const response: DataResponse = JSON.parse(fileContent)
    const transactions = response.data

    let quarterCount = 0

    for (const tx of transactions) {
      const price = parseInt(tx.TradePrice)
      const area = parseFloat(tx.Area)

      if (isNaN(price) || price <= 0 || isNaN(area) || area <= 0) {
        continue
      }

      await prisma.realEstateTransaction.create({
        data: {
          districtName: tx.DistrictName,
          districtCode: tx.DistrictCode || '',
          tradePrice: price,
          propertyType: tx.Type,
          floorPlan: tx.FloorPlan || null,
          area: area,
          buildingYear: tx.BuildingYear || null,
          structure: tx.Structure || null,
          year: year,
          quarter: quarter,
          period: tx.Period,
        },
      })

      quarterCount++
    }

    console.log(`✅ ${year}年第${quarter}四半期: ${quarterCount}件`)
    totalCount += quarterCount
  }

  console.log(`\n✅ インポート完了`)
  console.log(`   合計: ${totalCount}件`)

  await prisma.$disconnect()
}

importRealEstateTransactions()
  .catch(error => {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  })
