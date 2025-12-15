import * as fs from 'fs'
import * as path from 'path'

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

function analyzeRealEstateData() {
  console.log('📊 不動産データ分析\n')

  const dataDir = path.join(process.cwd(), 'data', 'real-estate')
  const year = '2024'
  const quarters = ['1', '2', '3', '4']

  let allTransactions: Transaction[] = []

  for (const quarter of quarters) {
    const filePath = path.join(dataDir, `urayasu_transactions_${year}_q${quarter}.json`)
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const response: DataResponse = JSON.parse(fileContent)
      allTransactions = allTransactions.concat(response.data)
      console.log(`✅ 第${quarter}四半期: ${response.data.length}件`)
    }
  }

  console.log(`\n📈 合計取引件数: ${allTransactions.length}件\n`)

  const typeCount = new Map<string, number>()
  const districtCount = new Map<string, number>()
  const floorPlanCount = new Map<string, number>()
  const priceList: number[] = []
  const areaList: number[] = []

  allTransactions.forEach(tx => {
    typeCount.set(tx.Type, (typeCount.get(tx.Type) || 0) + 1)
    districtCount.set(tx.DistrictName, (districtCount.get(tx.DistrictName) || 0) + 1)

    if (tx.FloorPlan) {
      floorPlanCount.set(tx.FloorPlan, (floorPlanCount.get(tx.FloorPlan) || 0) + 1)
    }

    const price = parseInt(tx.TradePrice)
    if (!isNaN(price) && price > 0) {
      priceList.push(price)
    }

    const area = parseFloat(tx.Area)
    if (!isNaN(area) && area > 0) {
      areaList.push(area)
    }
  })

  console.log('🏠 物件タイプ別分布:')
  Array.from(typeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}件 (${((count / allTransactions.length) * 100).toFixed(1)}%)`)
    })

  console.log('\n📍 地区別分布 (Top 10):')
  Array.from(districtCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([district, count]) => {
      console.log(`   ${district}: ${count}件`)
    })

  console.log('\n🏘️ 間取り分布 (Top 10):')
  Array.from(floorPlanCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([plan, count]) => {
      console.log(`   ${plan}: ${count}件`)
    })

  if (priceList.length > 0) {
    priceList.sort((a, b) => a - b)
    const avgPrice = priceList.reduce((a, b) => a + b, 0) / priceList.length
    const medianPrice = priceList[Math.floor(priceList.length / 2)]
    const minPrice = priceList[0]
    const maxPrice = priceList[priceList.length - 1]

    console.log('\n💰 取引価格分析:')
    console.log(`   最低価格: ${(minPrice / 10000).toFixed(0)}万円`)
    console.log(`   最高価格: ${(maxPrice / 10000).toFixed(0)}万円`)
    console.log(`   平均価格: ${(avgPrice / 10000).toFixed(0)}万円`)
    console.log(`   中央値: ${(medianPrice / 10000).toFixed(0)}万円`)

    const q1 = priceList[Math.floor(priceList.length * 0.25)]
    const q3 = priceList[Math.floor(priceList.length * 0.75)]
    console.log(`   第1四分位: ${(q1 / 10000).toFixed(0)}万円`)
    console.log(`   第3四分位: ${(q3 / 10000).toFixed(0)}万円`)
  }

  if (areaList.length > 0) {
    areaList.sort((a, b) => a - b)
    const avgArea = areaList.reduce((a, b) => a + b, 0) / areaList.length
    const medianArea = areaList[Math.floor(areaList.length / 2)]

    console.log('\n📐 面積分析:')
    console.log(`   最小面積: ${areaList[0]}㎡`)
    console.log(`   最大面積: ${areaList[areaList.length - 1]}㎡`)
    console.log(`   平均面積: ${avgArea.toFixed(1)}㎡`)
    console.log(`   中央値: ${medianArea}㎡`)
  }

  console.log('\n📋 データフィールド一覧:')
  const sampleTx = allTransactions[0]
  Object.keys(sampleTx).forEach(key => {
    const value = sampleTx[key as keyof Transaction]
    const hasValue = value !== '' && value !== null && value !== undefined
    console.log(`   ${key}: ${hasValue ? '✅ データあり' : '⚠️ 空値'}`)
  })

  console.log('\n✅ 分析完了')
}

analyzeRealEstateData()
