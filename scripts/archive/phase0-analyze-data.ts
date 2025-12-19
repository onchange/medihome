import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MedicalRecord {
  ID: string
  正式名称: string
  所在地: string
  '所在地座標（緯度）': string
  '所在地座標（経度）': string
  案内用ホームページアドレス?: string
  合計病床数?: string
  _診療科目リスト?: string[]
  _診療科詳細?: any[]
}

async function analyzeData() {
  console.log('📊 実データ分析レポート\n')
  console.log('='.repeat(60))

  const rawRecords = await prisma.medicalFacilityRaw.findMany()
  console.log(`\n総レコード数: ${rawRecords.length}件\n`)

  const parsed = rawRecords.map(r => JSON.parse(r.rawData) as MedicalRecord)

  console.log('【利用可能なフィールド】')
  const allKeys = new Set<string>()
  parsed.forEach(record => {
    Object.keys(record).forEach(key => allKeys.add(key))
  })
  console.log(Array.from(allKeys).filter(k => !k.startsWith('_')).sort().slice(0, 20).join(', '))
  console.log('...(他多数)')
  console.log()

  console.log('【施設タイプ分析】')
  const hospitals = parsed.filter(r => parseInt(r['合計病床数'] || '0') >= 20)
  const clinics = parsed.filter(r => parseInt(r['合計病床数'] || '0') < 20)
  console.log(`  病院（20床以上）: ${hospitals.length}件`)
  console.log(`  診療所（19床以下）: ${clinics.length}件`)
  console.log()

  console.log('【診療科目分布】')
  const specialties = new Map<string, number>()
  parsed.forEach(record => {
    const specs = record._診療科目リスト || []
    specs.forEach(s => {
      const trimmed = s.trim()
      if (trimmed) {
        specialties.set(trimmed, (specialties.get(trimmed) || 0) + 1)
      }
    })
  })

  const sortedSpecs = Array.from(specialties.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  sortedSpecs.forEach(([spec, count]) => {
    const bar = '█'.repeat(Math.min(count, 30))
    console.log(`  ${spec.padEnd(20)} ${bar} ${count}件`)
  })
  console.log()

  console.log('【座標データ】')
  const withCoords = parsed.filter(r => r['所在地座標（緯度）'] && r['所在地座標（経度）']).length
  console.log(`  緯度経度あり: ${withCoords}件 (${((withCoords / parsed.length) * 100).toFixed(1)}%)`)
  console.log()

  console.log('【Webサイト】')
  const withWebsite = parsed.filter(r => r['案内用ホームページアドレス']).length
  console.log(`  Webサイトあり: ${withWebsite}件 (${((withWebsite / parsed.length) * 100).toFixed(1)}%)`)
  console.log()

  console.log('【推奨事項】')
  console.log(`  ✅ 浦安市のデータは十分です（${parsed.length}件）`)

  if (specialties.has('小児科')) {
    console.log(`  ✅ 小児科データあり（${specialties.get('小児科')}件）→ 子育てスコア算出可能`)
  }

  if (specialties.has('内科')) {
    console.log(`  ✅ 内科データあり（${specialties.get('内科')}件）→ 一般医療スコア算出可能`)
  }

  if (withCoords === parsed.length) {
    console.log(`  ✅ 全施設に緯度経度データあり → 距離計算可能`)
  } else {
    console.log(`  ⚠️ 一部施設に緯度経度データなし → ジオコーディング要検討`)
  }

  console.log()

  console.log('='.repeat(60))
  console.log('\n💡 次のステップ:')
  console.log('  1. 上記の分析結果を確認')
  console.log('  2. 本実装（Phase 1）へ進む準備完了')
  console.log()

  await prisma.$disconnect()
}

analyzeData().catch(console.error)
