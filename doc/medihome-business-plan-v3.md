# MediHome 事業計画書 v3.0
**医療アクセス×不動産分析プラットフォーム - 実装最適化版**

**作成日**: 2024年12月14日  
**対象**: Claude Code実装  
**目的**: M3転職ポートフォリオ + 副業収益（月5-10万円）

---

## 📋 目次

1. [エグゼクティブサマリー](#1-エグゼクティブサマリー)
2. [技術スタック（最終決定版）](#2-技術スタック最終決定版)
3. [開発フェーズ](#3-開発フェーズ)
4. [データ設計](#4-データ設計)
5. [Phase 0: データ探索フェーズ](#5-phase-0-データ探索フェーズ)
6. [Phase 1: MVP実装手順](#6-phase-1-mvp実装手順)
7. [本番デプロイ手順](#7-本番デプロイ手順)
8. [収益化とM3転職](#8-収益化とm3転職)
9. [Claude Code実装指示](#9-claude-code実装指示)

---

## 1. エグゼクティブサマリー

### プロジェクト概要

**MediHome** = 医療アクセス × 不動産分析プラットフォーム

```
コンセプト:
「この街、小児科あるの？」
「総合病院まで何分？」
→ 住まい選びの新しい判断軸を提供

差別化:
既存の不動産サイト: 物件スペックのみ
MediHome: 物件 + 医療アクセススコア（独自算出）
```

### 戦略的目的

1. **M3転職の武器**: 医療データ分析×フルスタック開発の実績
2. **副業収益**: 月5-10万円（AdSense + アフィリエイト）
3. **社会貢献**: 医療アクセス格差の可視化

### 16ヶ月マイルストーン

| Month | 目標 | 収益 |
|-------|------|------|
| 2 | MVPローカル完成 | ¥0 |
| 3 | 浦安市版デプロイ | ¥0 |
| 6 | 3市展開 | ¥0 |
| 9 | AdSense承認 | ¥3,000/月 |
| 12 | 5市展開 | ¥30,000/月 |
| 16 | M3転職申請 | ¥50,000/月 |

---

## 2. 技術スタック（最終決定版）

### 2.1 全体構成

```
┌─────────────────────────────┐
│   Next.js 14 (App Router)   │  ← フロント+API
├─────────────────────────────┤
│   SQLite (MVP)              │  ← ローカルDB
│   Cloudflare D1 (本番)       │  ← エッジDB
└─────────────────────────────┘
│
├─ デプロイ: Cloudflare Pages (無料枠営利OK)
├─ スクリプト: TypeScript (tsx)
├─ ORM: Prisma (SQLite/D1両対応)
└─ 地図: Mapbox GL JS
```

### 2.2 詳細技術選定

#### フロントエンド・バックエンド

```json
{
  "name": "medihome",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "fetch:medical": "tsx scripts/fetchMedicalData.ts",
    "fetch:realestate": "tsx scripts/fetchRealEstateData.ts",
    "calc:scores": "tsx scripts/calculateScores.ts"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    
    "@prisma/client": "^5.7.0",
    "better-sqlite3": "^9.2.2",
    
    "mapbox-gl": "^3.0.1",
    "react-map-gl": "^7.1.7",
    "recharts": "^2.10.3",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    
    "zustand": "^4.4.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/better-sqlite3": "^7.6.8",
    "typescript": "^5",
    "prisma": "^5.7.0",
    
    "tsx": "^4.7.0",
    "@turf/turf": "^6.5.0",
    "@turf/distance": "^6.5.0",
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12",
    "@anthropic-ai/sdk": "^0.9.1",
    "csv-parser": "^3.0.0",
    
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "tailwindcss": "^3.4.0",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

#### データベース（段階的移行）

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  // MVP: SQLite（ローカル）
  provider = "sqlite"
  url      = "file:./dev.db"
  
  // 本番: Cloudflare D1（コメントアウト解除して切替）
  // provider = "sqlite"
  // url      = env("DATABASE_URL")
}

model MedicalFacility {
  id              String   @id @default(uuid())
  name            String
  postalCode      String?
  prefecture      String
  city            String
  address         String
  latitude        Float
  longitude       Float
  phoneNumber     String?
  website         String?
  
  specialties     String   // JSON文字列: ["内科", "小児科"]
  openingHours    String?  // JSON文字列
  closedDays      String?  // JSON文字列
  
  hasParking      Boolean  @default(false)
  hasBarrierFree  Boolean  @default(false)
  onlineBooking   Boolean  @default(false)
  emergencyNight  Boolean  @default(false)
  emergency24h    Boolean  @default(false)
  homeVisit       Boolean  @default(false)
  
  beds            Int      @default(0)
  
  dataSource      String
  lastUpdated     DateTime @default(now())
  createdAt       DateTime @default(now())
  
  @@index([city])
  @@map("medical_facilities")
}

model RealEstateTransaction {
  id                String   @id @default(uuid())
  
  prefecture        String
  city              String
  district          String?
  address           String
  latitude          Float
  longitude         Float
  
  price             Int
  buildingType      String
  area              Float?
  floorPlan         String?
  constructionYear  Int?
  structure         String?
  
  transactionPeriod String
  transactionDate   DateTime
  
  nearestStation    String?
  stationDistance   Int?
  
  dataSource        String
  createdAt         DateTime @default(now())
  
  @@index([city])
  @@index([transactionDate])
  @@map("real_estate_transactions")
}

model MedicalAccessScore {
  id                String   @id @default(uuid())
  
  address           String
  latitude          Float
  longitude         Float
  
  childcareScore    Float
  elderlyScore      Float
  generalScore      Float
  
  facilitiesScore   Float
  diversityScore    Float
  emergencyScore    Float
  hospitalScore     Float
  
  nearbyFacilities  String   // JSON文字列
  pediatricCount    Int?
  nearestHospitalKm Float?
  
  calculatedAt      DateTime @default(now())
  
  @@map("medical_access_scores")
}
```

#### TypeScriptスクリプト構成

```typescript
// scripts/shared/types.ts
export interface MedicalFacilityRaw {
  医療機関名: string
  郵便番号: string
  所在地: string
  電話番号: string
  診療科目: string
  // ...
}

export interface GeocodedLocation {
  latitude: number
  longitude: number
}

// scripts/shared/geocode.ts
import axios from 'axios'

export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  const url = 'https://msearch.gsi.go.jp/address-search/AddressSearch'
  try {
    const response = await axios.get(url, { params: { q: address } })
    if (response.data && response.data.length > 0) {
      const [lng, lat] = response.data[0].geometry.coordinates
      return { latitude: lat, longitude: lng }
    }
  } catch (error) {
    console.error(`Geocoding failed for ${address}:`, error)
  }
  return null
}

// scripts/shared/distance.ts
import { distance, point } from '@turf/turf'

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const from = point([lng1, lat1])
  const to = point([lng2, lat2])
  return distance(from, to, { units: 'kilometers' }) * 1000 // meters
}
```

### 2.3 インフラ比較

| 項目 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| **営利目的無料枠** | ❌ 不可 | ✅ 可能 |
| 転送量 | 100GB/月 | 無制限 |
| ビルド時間 | 6,000分/月 | 500ビルド/月 |
| エッジ関数 | あり（有料） | あり（無料） |
| DB統合 | Vercel Postgres | **Cloudflare D1** |
| コスト（本番） | $20/月〜 | **$0〜** |

**結論**: Cloudflare Pages + D1 が最適

---

## 3. 開発フェーズ

### Phase 0: データ探索・検証（Week 1）

```yaml
目標:
  - オープンデータの実態把握
  - データ品質確認
  - データ構造の最終決定
  - 機能要件の見直し

実施内容:
  1. 厚労省オープンデータダウンロード
  2. 生データをSQLiteに投入
  3. Prisma Studioで目視確認
  4. データ分析スクリプト実行
  5. スキーマ最適化
  6. 機能追加・変更の検討

成果物:
  - データ探索レポート
  - 最終版Prismaスキーマ
  - 実装可能な機能リスト
```

**重要**: このフェーズでデータの実態を確認してから、
本格的な実装（Phase 1）に進みます。

### Phase 1: MVPローカル開発（Week 2-8）

```yaml
目標:
  - ローカル環境で完全動作
  - 浦安市データ40件以上
  - スコア計算ロジック完成
  
技術:
  - Next.js + SQLite
  - TypeScriptスクリプトでデータ収集
  - Mapbox地図表示
  
成果物:
  - http://localhost:3000 で動作するMVP
  - M3面接でのデモ準備完了
```

### Phase 2: Cloudflare本番デプロイ（Week 9-10）

```yaml
目標:
  - 公開URL取得
  - SEO対策開始
  - Google Analytics設定
  
技術:
  - Cloudflare Pages
  - Cloudflare D1 (SQLite互換)
  - カスタムドメイン（任意）
  
成果物:
  - https://medihome.pages.dev
  - 初期コンテンツ3記事
```

### Phase 3: スケールと収益化（Week 11-64）

```yaml
Week 11-24: 機能拡充
  - エリア比較機能
  - ライフステージ切替
  - 3市展開
  
Week 25-36: 収益化開始
  - Google AdSense
  - アフィリエイト
  - 月3,000円達成
  
Week 37-64: M3転職準備
  - 5市展開
  - 実績データまとめ
  - 月50,000円達成
```

---

## 4. データ設計

### 4.1 データフロー

```
[厚労省CSV] ──┐
              ├→ [TypeScriptスクリプト] → [ジオコーディング] → [SQLite]
[国交省API] ──┘                                                    ↓
                                                        [スコア計算スクリプト]
                                                                    ↓
                                                          [医療アクセススコア]
                                                                    ↓
                                                          [Next.js API Routes]
                                                                    ↓
                                                          [React Components]
```

### 4.2 スコア計算アルゴリズム（TypeScript版）

```typescript
// scripts/calculateScores.ts

import { PrismaClient } from '@prisma/client'
import { calculateDistance } from './shared/distance'

const prisma = new PrismaClient()

interface ScoreResult {
  totalScore: number
  facilitiesScore: number
  diversityScore: number
  emergencyScore: number
  hospitalScore: number
  nearbyFacilities: any[]
  pediatricCount?: number
  nearestHospitalKm?: number
}

async function calculateMedicalAccessScore(
  targetLat: number,
  targetLng: number,
  profile: 'childcare' | 'elderly' | 'general' = 'childcare'
): Promise<ScoreResult> {
  
  // 全医療機関取得
  const facilities = await prisma.medicalFacility.findMany({
    where: { city: '浦安市' }
  })
  
  // 距離計算
  const facilitiesWithDistance = facilities.map(f => ({
    ...f,
    distance: calculateDistance(targetLat, targetLng, f.latitude, f.longitude),
    specialties: JSON.parse(f.specialties) as string[]
  }))
  
  // 徒歩圏内（800m）の施設
  const nearby800m = facilitiesWithDistance.filter(f => f.distance <= 800)
  
  let facilitiesScore = 0
  let emergencyScore = 0
  let pediatricCount: number | undefined
  
  if (profile === 'childcare') {
    const pediatric = nearby800m.filter(f => 
      f.specialties.includes('小児科')
    )
    const emergency = nearby800m.filter(f => f.emergencyNight)
    
    facilitiesScore = Math.min(pediatric.length * 15, 40)
    emergencyScore = emergency.length > 0 ? 20 : 0
    pediatricCount = pediatric.length
    
  } else if (profile === 'elderly') {
    const homeVisit = nearby800m.filter(f => f.homeVisit)
    facilitiesScore = Math.min(homeVisit.length * 10, 40)
    emergencyScore = homeVisit.length > 0 ? 20 : 0
    
  } else {
    facilitiesScore = Math.min(nearby800m.length * 5, 40)
    emergencyScore = nearby800m.some(f => f.emergency24h) ? 20 : 0
  }
  
  // 診療科多様性
  const allSpecialties = new Set<string>()
  nearby800m.forEach(f => {
    f.specialties.forEach(s => allSpecialties.add(s))
  })
  const diversityScore = Math.min(allSpecialties.size * 3, 30)
  
  // 総合病院距離
  const hospitals = facilitiesWithDistance.filter(f => f.beds >= 100)
  let hospitalScore = 0
  let nearestHospitalKm: number | undefined
  
  if (hospitals.length > 0) {
    const nearest = Math.min(...hospitals.map(h => h.distance))
    nearestHospitalKm = nearest / 1000
    hospitalScore = Math.max(10 - (nearest / 1000) * 2, 0)
  }
  
  const totalScore = facilitiesScore + diversityScore + emergencyScore + hospitalScore
  
  return {
    totalScore: Math.round(totalScore * 10) / 10,
    facilitiesScore,
    diversityScore,
    emergencyScore,
    hospitalScore,
    nearbyFacilities: nearby800m.slice(0, 10), // 最大10件
    pediatricCount,
    nearestHospitalKm
  }
}

async function main() {
  // 主要エリアのスコア事前計算
  const targetAreas = [
    { name: '浦安駅周辺', lat: 35.6542, lng: 139.9061 },
    { name: '新浦安駅周辺', lat: 35.6473, lng: 139.9135 },
    { name: '舞浜駅周辺', lat: 35.6346, lng: 139.8823 },
  ]
  
  for (const area of targetAreas) {
    console.log(`\n${area.name}のスコア計算中...`)
    
    const childcare = await calculateMedicalAccessScore(area.lat, area.lng, 'childcare')
    const elderly = await calculateMedicalAccessScore(area.lat, area.lng, 'elderly')
    const general = await calculateMedicalAccessScore(area.lat, area.lng, 'general')
    
    await prisma.medicalAccessScore.create({
      data: {
        address: area.name,
        latitude: area.lat,
        longitude: area.lng,
        childcareScore: childcare.totalScore,
        elderlyScore: elderly.totalScore,
        generalScore: general.totalScore,
        facilitiesScore: childcare.facilitiesScore,
        diversityScore: childcare.diversityScore,
        emergencyScore: childcare.emergencyScore,
        hospitalScore: childcare.hospitalScore,
        nearbyFacilities: JSON.stringify(childcare.nearbyFacilities),
        pediatricCount: childcare.pediatricCount,
        nearestHospitalKm: childcare.nearestHospitalKm
      }
    })
    
    console.log(`  子育てスコア: ${childcare.totalScore}`)
    console.log(`  高齢者スコア: ${elderly.totalScore}`)
    console.log(`  総合スコア: ${general.totalScore}`)
  }
  
  await prisma.$disconnect()
  console.log('\n✅ スコア計算完了！')
}

main().catch(console.error)
```

---

## 5. Phase 0: データ探索フェーズ

### 5.0 目的

実際のオープンデータを確認してから、データ構造と機能を最終決定します。

### 5.1 環境セットアップ

```bash
# Step 1: プロジェクト作成
npx create-next-app@latest medihome --typescript --tailwind --app --src-dir
cd medihome

# Step 2: 最小限の依存関係
npm install @prisma/client better-sqlite3
npm install -D prisma @types/better-sqlite3 tsx csv-parse

# Step 3: Prisma初期化
npx prisma init --datasource-provider sqlite
```

### 5.2 探索用シンプルスキーマ

```prisma
// prisma/schema.prisma（探索用・最小版）

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// 生データをそのまま格納（探索用）
model MedicalFacilityRaw {
  id              Int      @id @default(autoincrement())
  rawData         String   // JSON文字列で全データを保存
  createdAt       DateTime @default(now())
  
  @@map("medical_facilities_raw")
}

// 後で使いやすいように変換したデータ
model MedicalFacility {
  id              String   @id @default(uuid())
  name            String
  city            String
  address         String
  latitude        Float?
  longitude       Float?
  specialties     String   // JSON文字列
  rawData         String   // 元データも保持
  
  @@map("medical_facilities")
}
```

```bash
npx prisma db push
npx prisma generate
```

### 5.3 データダウンロードスクリプト

```typescript
// scripts/phase0-download-data.ts

import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'

async function downloadMedicalData() {
  console.log('📥 厚労省オープンデータをダウンロード中...\n')
  
  // 医療機能情報提供制度のデータ
  // 実際のURLは以下から取得：
  // https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/teikyouseido/
  
  const urls = {
    // 千葉県の診療所データ（例）
    clinics: 'https://example.mhlw.go.jp/data/chiba/clinics.csv',
    // 千葉県の病院データ（例）
    hospitals: 'https://example.mhlw.go.jp/data/chiba/hospitals.csv'
  }
  
  const dataDir = path.join(process.cwd(), 'data', 'raw')
  fs.mkdirSync(dataDir, { recursive: true })
  
  for (const [name, url] of Object.entries(urls)) {
    try {
      console.log(`  ${name}: ${url}`)
      
      // 実際のダウンロード（URLが有効な場合）
      // const response = await axios.get(url, { responseType: 'arraybuffer' })
      // fs.writeFileSync(
      //   path.join(dataDir, `${name}.csv`),
      //   response.data
      // )
      
      // MVP用: サンプルCSVを作成
      const sampleCSV = `医療機関名,郵便番号,所在地,電話番号,診療科目,診療時間,休診日
サンプル小児科クリニック,279-0001,千葉県浦安市当代島1-1-1,047-123-4567,小児科・内科,月-金 9:00-12:00 14:00-18:00,木曜午後・日祝
新浦安総合病院,279-0014,千葉県浦安市明海5-7-3,047-234-5678,内科・外科・小児科・整形外科,24時間,なし
舞浜ファミリークリニック,279-0031,千葉県浦安市舞浜3-4-1,047-345-6789,内科・小児科,月-土 9:00-12:30 15:00-18:30,水曜・日祝`
      
      fs.writeFileSync(
        path.join(dataDir, `${name}.csv`),
        sampleCSV,
        'utf-8'
      )
      
      console.log(`  ✅ ${name}.csv 保存完了\n`)
    } catch (error) {
      console.error(`  ❌ ${name} ダウンロード失敗:`, error)
    }
  }
  
  console.log('✅ ダウンロード完了！')
  console.log(`📁 保存先: ${dataDir}\n`)
}

downloadMedicalData().catch(console.error)
```

```bash
# 実行
npm run download:data  # package.jsonに追加が必要
# または
npx tsx scripts/phase0-download-data.ts
```

### 5.4 生データ投入スクリプト

```typescript
// scripts/phase0-import-raw.ts

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

async function importRawData() {
  console.log('📊 生データをSQLiteにインポート中...\n')
  
  const csvPath = path.join(process.cwd(), 'data', 'raw', 'clinics.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  // CSVパース
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true // BOM対応
  })
  
  console.log(`  取得件数: ${records.length}件\n`)
  
  // 生データとして全て保存
  for (const record of records) {
    await prisma.medicalFacilityRaw.create({
      data: {
        rawData: JSON.stringify(record, null, 2)
      }
    })
  }
  
  console.log('✅ インポート完了！')
  console.log('📊 Prisma Studioでデータを確認してください:')
  console.log('   npx prisma studio\n')
  
  await prisma.$disconnect()
}

importRawData().catch(console.error)
```

```bash
npx tsx scripts/phase0-import-raw.ts
```

### 5.5 データ探索（Prisma Studio）

```bash
# Prisma Studioを起動
npx prisma studio

# ブラウザで http://localhost:5555 が開く
# → medical_facilities_raw テーブルを確認
# → rawData列のJSONを展開して確認
```

**確認ポイント**:
```yaml
データ品質:
  - 欠損値はどのくらいあるか？
  - 住所フォーマットは統一されているか？
  - 診療科目の表記ゆれは？（小児科 vs 小児科）
  
データ構造:
  - どんなフィールドが利用可能か？
  - 緯度経度は含まれているか？（→ ジオコーディング必要）
  - 診療時間のフォーマットは？（→ パース処理が必要）
  
有用性:
  - 夜間診療のフラグはあるか？
  - 駐車場情報はあるか？
  - Web予約URLはあるか？
```

### 5.6 データ分析スクリプト

```typescript
// scripts/phase0-analyze-data.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeData() {
  console.log('📊 データ分析レポート\n')
  console.log('='.repeat(60))
  
  const rawRecords = await prisma.medicalFacilityRaw.findMany()
  console.log(`\n総レコード数: ${rawRecords.length}件\n`)
  
  // JSONパースして分析
  const parsed = rawRecords.map(r => JSON.parse(r.rawData))
  
  // 1. 利用可能なフィールド一覧
  console.log('【利用可能なフィールド】')
  const allKeys = new Set<string>()
  parsed.forEach(record => {
    Object.keys(record).forEach(key => allKeys.add(key))
  })
  console.log(Array.from(allKeys).sort().join(', '))
  console.log()
  
  // 2. 浦安市のデータ数
  const urayasuCount = parsed.filter(r => 
    r['所在地']?.includes('浦安市')
  ).length
  console.log(`【浦安市データ】 ${urayasuCount}件`)
  console.log()
  
  // 3. 診療科目の分布
  console.log('【診療科目TOP10】')
  const specialties = new Map<string, number>()
  parsed.forEach(record => {
    const specs = record['診療科目']?.split('・') || []
    specs.forEach(s => {
      const trimmed = s.trim()
      specialties.set(trimmed, (specialties.get(trimmed) || 0) + 1)
    })
  })
  
  const sortedSpecs = Array.from(specialties.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  sortedSpecs.forEach(([spec, count]) => {
    console.log(`  ${spec}: ${count}件`)
  })
  console.log()
  
  // 4. 欠損値チェック
  console.log('【欠損値チェック】')
  const fieldsToCheck = ['医療機関名', '所在地', '電話番号', '診療科目']
  fieldsToCheck.forEach(field => {
    const missingCount = parsed.filter(r => !r[field]).length
    const percentage = ((missingCount / parsed.length) * 100).toFixed(1)
    console.log(`  ${field}: ${missingCount}件欠損 (${percentage}%)`)
  })
  console.log()
  
  // 5. 推奨事項
  console.log('【推奨事項】')
  if (urayasuCount < 10) {
    console.log('  ⚠️  浦安市のデータが少ないため、近隣市も含めることを検討')
  }
  if (specialties.has('小児科')) {
    console.log(`  ✅ 小児科データあり（${specialties.get('小児科')}件）`)
  }
  console.log()
  
  console.log('='.repeat(60))
  console.log('\n💡 次のステップ:')
  console.log('  1. data/exploration-report.md にこの結果を保存')
  console.log('  2. Prismaスキーマを最適化')
  console.log('  3. 必要に応じて機能要件を見直し')
  console.log()
  
  await prisma.$disconnect()
}

analyzeData().catch(console.error)
```

```bash
npx tsx scripts/phase0-analyze-data.ts > data/exploration-report.md
```

### 5.7 探索結果に基づく判断

```yaml
判断基準:

1. データ品質が良好（欠損<20%）:
   → そのまま本実装へ
   
2. データ品質が不良（欠損>20%）:
   → スクレイピング補完を検討
   → または機能を削減
   
3. 浦安市データが少ない（<30件）:
   → 市川市・船橋市も含める
   → または対象エリアを変更
   
4. 必要なフィールドがない:
   → 代替データソースを探す
   → または機能を変更
```

### 5.8 スキーマ最終決定

```typescript
// scripts/phase0-finalize-schema.ts

/**
 * データ探索の結果をもとに、最終的なPrismaスキーマを決定
 */

const analysis = {
  // phase0-analyze-data.tsの結果
  totalRecords: 150,
  urayasuRecords: 42,
  availableFields: [
    '医療機関名', '所在地', '電話番号', '診療科目',
    '診療時間', '休診日', '駐車場', // 利用可能
    // '緯度経度' // → ない場合はジオコーディング必須
  ],
  missingRates: {
    '医療機関名': 0,
    '所在地': 0,
    '電話番号': 5,
    '診療科目': 2,
    '診療時間': 15,
    '駐車場': 40
  }
}

const recommendations = `
【Prismaスキーマ最終版】

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model MedicalFacility {
  id              String   @id @default(uuid())
  name            String   // 必須（欠損0%）
  city            String   // 必須
  address         String   // 必須（欠損0%）
  latitude        Float?   // ジオコーディング後に設定
  longitude       Float?
  
  phoneNumber     String?  // 欠損5%なのでOptional
  website         String?  // データになし、スクレイピング予定
  
  specialties     String   // JSON配列（欠損2%）
  openingHours    String?  // JSON（欠損15%）
  closedDays      String?  // JSON
  
  hasParking      Boolean  @default(false)  // 欠損40%なのでデフォルトfalse
  
  // 以下は初期MVPでは見送り（データなし）
  // hasBarrierFree  Boolean  @default(false)
  // onlineBooking   Boolean  @default(false)
  
  dataSource      String
  lastUpdated     DateTime @default(now())
  
  @@index([city])
  @@map("medical_facilities")
}
`

console.log(recommendations)

// この結果をもとにprisma/schema.prismaを更新
```

### 5.9 Phase 0完了チェックリスト

```markdown
## Phase 0 完了確認

- [ ] オープンデータをダウンロードした
- [ ] SQLiteに生データを投入した
- [ ] Prisma Studioでデータを目視確認した
- [ ] データ分析スクリプトを実行した
- [ ] exploration-report.mdを作成した
- [ ] Prismaスキーマを最終決定した
- [ ] 機能要件を見直した（必要に応じて）

✅ 全てチェックしたら Phase 1（本実装）へ進む
```

### 5.10 package.json更新

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    
    "phase0:download": "tsx scripts/phase0-download-data.ts",
    "phase0:import": "tsx scripts/phase0-import-raw.ts",
    "phase0:analyze": "tsx scripts/phase0-analyze-data.ts",
    "phase0:all": "npm run phase0:download && npm run phase0:import && npm run phase0:analyze"
  }
}
```

```bash
# Phase 0 を一括実行
npm run phase0:all
```

---

## 6. Phase 1: MVP実装手順

### 6.1 プロジェクトセットアップ

```bash
# Step 1: Next.jsプロジェクト作成
npx create-next-app@latest medihome --typescript --tailwind --app --src-dir
cd medihome

# Step 2: 依存関係インストール
npm install @prisma/client better-sqlite3 mapbox-gl react-map-gl recharts zustand zod
npm install -D prisma @types/better-sqlite3 tsx @turf/turf @turf/distance axios cheerio @anthropic-ai/sdk csv-parser

# Step 3: shadcn/ui セットアップ
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog

# Step 4: Prisma初期化
npx prisma init --datasource-provider sqlite

# 次に prisma/schema.prisma を上記の内容に置き換え

# Step 5: データベース作成
npx prisma db push
npx prisma generate
```

### 5.2 ディレクトリ構造

```
medihome/
├── src/
│   ├── app/
│   │   ├── page.tsx              # トップページ
│   │   ├── result/
│   │   │   └── page.tsx          # 検索結果ページ
│   │   ├── api/
│   │   │   └── search/
│   │   │       └── route.ts      # 検索API
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── AddressSearchForm.tsx
│   │   ├── MedicalMap.tsx
│   │   ├── AccessScoreCard.tsx
│   │   └── FacilityList.tsx
│   └── lib/
│       ├── prisma.ts             # Prisma Client
│       └── utils.ts
├── scripts/
│   ├── shared/
│   │   ├── types.ts
│   │   ├── geocode.ts
│   │   └── distance.ts
│   ├── fetchMedicalData.ts       # 医療機関データ取得
│   ├── fetchRealEstateData.ts    # 不動産データ取得
│   └── calculateScores.ts        # スコア計算
├── prisma/
│   ├── schema.prisma
│   └── dev.db                    # SQLiteデータベース
├── public/
├── .env.local
├── package.json
└── tsconfig.json
```

### 5.3 環境変数設定

```bash
# .env.local
DATABASE_URL="file:./dev.db"
MAPBOX_ACCESS_TOKEN="pk.ey..."  # https://www.mapbox.com で取得
ANTHROPIC_API_KEY="sk-ant-..."  # Claude API (任意、スクレイピング用)
```

### 5.4 データ収集スクリプト実装

```typescript
// scripts/fetchMedicalData.ts

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { geocodeAddress } from './shared/geocode'

const prisma = new PrismaClient()

interface MedicalFacilityCSV {
  医療機関名: string
  郵便番号: string
  所在地: string
  電話番号: string
  診療科目: string
  診療時間: string
  休診日: string
  // ...追加フィールド
}

async function fetchChibaMedicalData(): Promise<MedicalFacilityCSV[]> {
  // 実際のURLは厚労省の最新データに置き換え
  // const url = 'https://...'
  // const response = await axios.get(url)
  
  // MVP用: サンプルデータ
  return [
    {
      医療機関名: 'サンプル小児科クリニック',
      郵便番号: '279-0001',
      所在地: '千葉県浦安市当代島1-1-1',
      電話番号: '047-xxx-xxxx',
      診療科目: '小児科、内科',
      診療時間: '月-金 9:00-12:00, 14:00-18:00',
      休診日: '木曜午後、日曜、祝日'
    },
    // ...他のサンプルデータ
  ]
}

async function saveToDatabase(data: MedicalFacilityCSV[]) {
  for (const row of data) {
    const location = await geocodeAddress(row.所在地)
    
    if (!location) {
      console.warn(`ジオコーディング失敗: ${row.医療機関名}`)
      continue
    }
    
    const specialties = row.診療科目.split('、').map(s => s.trim())
    
    await prisma.medicalFacility.create({
      data: {
        name: row.医療機関名,
        postalCode: row.郵便番号,
        prefecture: '千葉県',
        city: '浦安市',
        address: row.所在地,
        latitude: location.latitude,
        longitude: location.longitude,
        phoneNumber: row.電話番号,
        specialties: JSON.stringify(specialties),
        closedDays: JSON.stringify(row.休診日.split('、')),
        dataSource: '厚労省オープンデータ'
      }
    })
    
    console.log(`✓ ${row.医療機関名}`)
  }
}

async function main() {
  console.log('医療機関データ取得開始...')
  const data = await fetchChibaMedicalData()
  console.log(`取得件数: ${data.length}`)
  
  console.log('\nデータベース保存中...')
  await saveToDatabase(data)
  
  await prisma.$disconnect()
  console.log('\n✅ 完了！')
}

main().catch(console.error)
```

### 5.5 API Routes実装

```typescript
// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { geocodeAddress } from '@/lib/geocode'
import { calculateDistance } from '@/lib/distance'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const profile = searchParams.get('profile') || 'childcare'
  
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }
  
  // ジオコーディング
  const location = await geocodeAddress(address)
  if (!location) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }
  
  // 事前計算されたスコアを検索（近いもの）
  const preCalculated = await prisma.medicalAccessScore.findFirst({
    where: {
      // 簡易的に最も近いスコアを返す
      // 本番では空間検索を実装
    }
  })
  
  // 医療機関リスト取得
  const facilities = await prisma.medicalFacility.findMany({
    where: { city: '浦安市' }
  })
  
  // 距離計算してソート
  const facilitiesWithDistance = facilities
    .map(f => ({
      ...f,
      distance: calculateDistance(
        location.latitude,
        location.longitude,
        f.latitude,
        f.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20)
  
  return NextResponse.json({
    location,
    score: preCalculated || { childcareScore: 0 },
    facilities: facilitiesWithDistance
  })
}
```

### 5.6 フロントエンド実装

```typescript
// src/app/page.tsx

import AddressSearchForm from '@/components/AddressSearchForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-6">
          医療アクセスで選ぶ、<br />
          新しい住まい探し
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          MediHomeは、医療環境を可視化する<br />
          日本初の不動産分析プラットフォームです
        </p>
        
        <div className="max-w-2xl mx-auto">
          <AddressSearchForm />
        </div>
        
        {/* 免責事項 */}
        <div className="max-w-4xl mx-auto mt-16 p-6 bg-yellow-50 border-l-4 border-yellow-400">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ 免責事項</h3>
          <p className="text-sm text-yellow-700">
            本サイトの情報は参考情報です。最新情報は各医療機関に直接ご確認ください。
            本サイトの情報のみを根拠とした不動産取引はお控えください。
          </p>
        </div>
      </div>
    </div>
  )
}
```

```typescript
// src/components/AddressSearchForm.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AddressSearchForm() {
  const [address, setAddress] = useState('')
  const router = useRouter()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      router.push(`/result?address=${encodeURIComponent(address)}`)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="住所を入力（例: 千葉県浦安市当代島）"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">検索</Button>
    </form>
  )
}
```

```typescript
// src/app/result/page.tsx

import { Suspense } from 'react'
import AccessScoreCard from '@/components/AccessScoreCard'
import MedicalMap from '@/components/MedicalMap'
import FacilityList from '@/components/FacilityList'

async function fetchMedicalData(address: string) {
  const response = await fetch(
    `http://localhost:3000/api/search?address=${encodeURIComponent(address)}`
  )
  return response.json()
}

export default async function ResultPage({
  searchParams
}: {
  searchParams: { address: string }
}) {
  const data = await fetchMedicalData(searchParams.address)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {searchParams.address} の医療アクセス
      </h1>
      
      <div className="grid gap-8">
        <AccessScoreCard score={data.score} />
        <MedicalMap 
          center={data.location} 
          facilities={data.facilities} 
        />
        <FacilityList facilities={data.facilities} />
      </div>
    </div>
  )
}
```

### 5.7 動作確認

```bash
# 1. データ収集
npm run fetch:medical
npm run calc:scores

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザで確認
# http://localhost:3000
```

---

## 7. 本番デプロイ手順

### 7.1 Cloudflare Pages デプロイ

#### Step 1: Cloudflare D1 データベース作成

```bash
# Wrangler CLI インストール
npm install -g wrangler

# Cloudflareログイン
wrangler login

# D1データベース作成
wrangler d1 create medihome-db

# 出力例:
# [[d1_databases]]
# binding = "DB"
# database_name = "medihome-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### Step 2: Prismaスキーマ更新

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// マイグレーション生成
// npx prisma migrate dev --name init
// → migration.sql が生成される
```

#### Step 3: D1にマイグレーション適用

```bash
# prisma/migrations/**/*.sql の内容をD1に適用
wrangler d1 execute medihome-db --file=./prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql
```

#### Step 4: GitHubリポジトリ作成・プッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/medihome.git
git push -u origin main
```

#### Step 5: Cloudflare Pages 設定

1. Cloudflare Dashboard → Pages → "Create a project"
2. GitHub連携 → medihomeリポジトリ選択
3. ビルド設定:
   ```
   Build command: npm run build
   Build output directory: .next
   Framework preset: Next.js
   ```
4. 環境変数設定:
   ```
   DATABASE_URL=（D1のConnection String）
   MAPBOX_ACCESS_TOKEN=pk.ey...
   ```
5. Deploy

#### Step 6: データ投入

```bash
# ローカルのSQLiteデータをD1にコピー
# 方法1: CSV経由
sqlite3 prisma/dev.db ".dump medical_facilities" > facilities.sql
wrangler d1 execute medihome-db --file=facilities.sql

# 方法2: スクリプト再実行（本番DB接続）
DATABASE_URL="cloudflare-d1-url" npm run fetch:medical
DATABASE_URL="cloudflare-d1-url" npm run calc:scores
```

### 7.2 カスタムドメイン設定（任意）

```bash
# Cloudflare Pages → Custom domains
# 例: medihome.com
# DNS設定: CNAMEレコード追加
```

### 7.3 Cloudflare無料枠の制限

```yaml
D1 Database:
  - データベース数: 10個
  - ストレージ: 5GB
  - 読み取り: 500万回/日
  - 書き込み: 10万回/日
  
Pages:
  - プロジェクト数: 100個
  - ビルド数: 500回/月
  - 転送量: 無制限
  
→ 月間PV 10万程度まで無料で運用可能
```

---

## 8. 収益化とM3転職

### 8.1 収益化戦略

#### Google AdSense（Month 7-9）

```yaml
審査準備:
  - 記事10本以上
  - プライバシーポリシー
  - お問い合わせフォーム
  - 免責事項

目標:
  Month 9: 審査通過
  Month 12: 月2,000円
  Month 16: 月5,000円
  
RPM（不動産ジャンル）: 300-600円
必要PV: 月10,000PV
```

#### アフィリエイト（Month 9-12）

```yaml
SUUMO・HOME'S:
  報酬: 資料請求 500-1,000円/件
  目標: 月10件 = 5,000-10,000円

引越し侍:
  報酬: 見積もり 3,000-5,000円/件
  目標: 月5件 = 15,000-25,000円

合計: 月20,000-35,000円
```

### 8.2 M3転職アピール資料

#### ポートフォリオサイト

```markdown
# MediHome - 医療アクセス分析プラットフォーム

## 開発動機
高齢化社会において、医療アクセスは住まい選びの重要要素です。
しかし、それを定量的に評価するツールが存在しませんでした。

## 技術スタック
- フロントエンド: Next.js 14, TypeScript, Tailwind CSS
- バックエンド: Cloudflare Workers, Cloudflare D1
- データ処理: TypeScript, Turf.js（地理空間計算）
- AI活用: Claude API（データ収集）

## 実績
- 対象エリア: 5市区町村
- 医療機関データ: 250施設
- 月間PV: 10,000
- 月間収益: 50,000円

## M3への貢献提案
「M3 Medical Access Platform」として全国展開
- B2G（自治体）: 医療過疎地域分析SaaS
- B2B（不動産業界）: APIライセンス
- B2C（一般ユーザー）: 医療アクセス情報
```

#### 面接想定Q&A

```markdown
Q: なぜこのプロジェクトを始めたのか？
A: M3への転職を見据え、医療×テクノロジー領域での
   実績を作りたいと考えました。単なる学習ではなく、
   実際のユーザーに価値を提供し、収益化まで実現する
   ことで、ビジネスセンスも証明したいと考えました。

Q: 技術的に一番苦労した点は？
A: 地理空間データの扱いです。PostGISの学習から始め、
   最終的にはCloudflare D1（SQLite）+ Turf.jsで
   効率的な距離計算を実装しました。

Q: M3でどう活かせるか？
A: M3の医療情報プラットフォームに「患者の生活圏」
   という新しい軸を加えることができます。
   在宅医療の需給マッチングなど、新規事業にも展開可能です。
```

---

## 9. Claude Code実装指示

### 9.1 Phase 0: データ探索から開始

```markdown
# MediHome 開発開始

## 重要: Phase 0から始めます

データの実態を確認してから本格実装に進むため、
まずPhase 0（データ探索）を実施します。

## Phase 0: セットアップ

```bash
npx create-next-app@latest medihome --typescript --tailwind --app --src-dir
cd medihome

npm install @prisma/client better-sqlite3
npm install -D prisma @types/better-sqlite3 tsx csv-parse axios

npx prisma init --datasource-provider sqlite
```

## Phase 0: スキーマ（探索用・最小版）

`prisma/schema.prisma` を以下に置き換え：

（セクション5.2の探索用スキーマ）

```bash
npx prisma db push
npx prisma generate
```

## Phase 0: スクリプト作成

以下のファイルを作成してください：

1. `scripts/phase0-download-data.ts`（セクション5.3）
2. `scripts/phase0-import-raw.ts`（セクション5.4）
3. `scripts/phase0-analyze-data.ts`（セクション5.6）

## Phase 0: 実行

```bash
# package.jsonに追加
{
  "scripts": {
    "phase0:download": "tsx scripts/phase0-download-data.ts",
    "phase0:import": "tsx scripts/phase0-import-raw.ts",
    "phase0:analyze": "tsx scripts/phase0-analyze-data.ts"
  }
}

# 実行
npm run phase0:download
npm run phase0:import
npx prisma studio  # データ確認
npm run phase0:analyze
```

## Phase 0: 完了後

1. `data/exploration-report.md` を確認
2. データ品質・構造を確認
3. 必要に応じてスキーマを最適化
4. 機能要件を見直し

✅ Phase 0完了後、Phase 1（本実装）へ進みます
```

### 9.2 Phase 1: 本実装開始

```markdown
# MediHome MVP開発開始

## 目標
医療アクセス×不動産分析プラットフォームのMVPを
ローカル環境（SQLite）で構築します。

## Phase 1: プロジェクトセットアップ

以下のコマンドを順に実行してください：

```bash
npx create-next-app@latest medihome --typescript --tailwind --app --src-dir
cd medihome

npm install @prisma/client better-sqlite3 mapbox-gl react-map-gl recharts zustand zod

npm install -D prisma @types/better-sqlite3 tsx @turf/turf @turf/distance axios cheerio @anthropic-ai/sdk csv-parser

npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog

npx prisma init --datasource-provider sqlite
```

## Phase 2: Prismaスキーマ設定

`prisma/schema.prisma` を以下の内容に置き換えてください：

（セクション4.2のschema.prismaの内容）

その後：
```bash
npx prisma db push
npx prisma generate
```

## Phase 3: scriptsディレクトリ作成

以下のファイルを作成してください：

1. `scripts/shared/types.ts`
2. `scripts/shared/geocode.ts`（セクション2.2のコード）
3. `scripts/shared/distance.ts`（セクション2.2のコード）
4. `scripts/fetchMedicalData.ts`（セクション5.4のコード）
5. `scripts/calculateScores.ts`（セクション4.2のコード）

## Phase 4: API Routes

`src/app/api/search/route.ts` を作成（セクション5.5のコード）

## Phase 5: フロントエンド

以下のコンポーネントを作成：
- `src/app/page.tsx`（セクション5.6）
- `src/components/AddressSearchForm.tsx`（セクション5.6）
- `src/app/result/page.tsx`（セクション5.6）

## Phase 6: 動作確認

```bash
npm run fetch:medical
npm run calc:scores
npm run dev
```

http://localhost:3000 にアクセスして動作確認

それでは開始してください！
```

### 9.2 Phase 1: 本実装開始

```markdown
# Phase 1: MVP本格実装

Phase 0でデータ構造を確認したので、本実装を開始します。

## 最終版Prismaスキーマ適用

Phase 0の分析結果をもとに最適化したスキーマに更新：

（セクション4のPrismaスキーマ、またはPhase 0で最適化したスキーマ）

```bash
npx prisma db push --force-reset  # 探索用スキーマをリセット
npx prisma generate
```

## 依存関係追加

```bash
npm install mapbox-gl react-map-gl recharts zustand zod
npm install -D @turf/turf @turf/distance @anthropic-ai/sdk cheerio
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog
```

## データ収集スクリプト（本番版）

セクション6の以下を実装：
- `scripts/fetchMedicalData.ts`
- `scripts/calculateScores.ts`

## フロントエンド実装

セクション6の以下を実装：
- `src/app/page.tsx`
- `src/app/result/page.tsx`
- `src/app/api/search/route.ts`
- `src/components/*`

## 動作確認

```bash
npm run fetch:medical
npm run calc:scores
npm run dev
```

http://localhost:3000 で動作確認
```

### 9.3 デバッグ時の指示

```markdown
# エラーが発生した場合

## Prismaエラー
```bash
npx prisma generate
npx prisma db push --force-reset
```

## TypeScriptエラー
```bash
npm run build
# エラー箇所を修正
```

## 地図が表示されない
- MAPBOX_ACCESS_TOKENが設定されているか確認
- https://www.mapbox.com でアカウント作成・トークン取得

## データが取得できない
- scripts/fetchMedicalData.ts のサンプルデータで動作確認
- ジオコーディングAPIの制限に注意（1秒1リクエスト推奨）
```

---

**この事業計画書v3.0は、完全にCloudflare + SQLite + TypeScript構成に最適化されています。**

**MVP（ローカル）から本番デプロイまで、実装可能なレベルで具体化されています。**

**Claude Codeでステップバイステップで進めてください！**
