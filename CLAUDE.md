# MediHome 開発ガイド

## プロジェクト概要

東京23区の医療アクセス格差を可視化するWebサービス。子育て・高齢者・一般医療の3視点からスコアリングし、引っ越し先選びの参考情報を提供。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + TypeScript + React 19
- **データベース**: Prisma ORM + SQLite (開発) / PostgreSQL (本番)
- **地図**: Leaflet + React Leaflet + OpenStreetMap
- **スタイル**: TailwindCSS v4
- **データソース**: 厚生労働省 医療情報ネット オープンデータ

## ディレクトリ構成

```
medihome/
├── data/mhlw/           # 厚労省データ (csv/, zip/)
├── prisma/              # DBスキーマ + dev.db
├── scripts/             # データ取得・インポート・スコア計算
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── page.tsx     # トップ（ダッシュボード）
│   │   ├── search/      # 区別詳細ページ
│   │   ├── api/         # REST API
│   │   └── legal/       # 法的ページ (scoring, disclaimer, attribution)
│   ├── components/      # Reactコンポーネント
│   ├── lib/             # ユーティリティ (prisma.ts, score-utils.ts)
│   └── types/           # TypeScript型定義
└── doc/                 # 仕様書
```

## 主要コマンド

```bash
npm run dev              # 開発サーバー (port 4000)
npm run build            # 本番ビルド
npm run setup:mhlw       # データセットアップ一括 (fetch → import → scores)
npm run fetch:mhlw       # 厚労省データダウンロード
npm run import:mhlw      # データインポート (東京23区のみ抽出)
npm run calculate:scores # スコア再計算
npm run db:studio        # Prisma Studio
```

## スコア計算ロジック

**重要**: 密度ベース（施設数/km²）× パーセンタイル順位方式

### 計算式
1. 各区の面積で施設数を割って密度を算出
2. 23区内での相対順位をパーセンタイル（0-100）に変換
3. カテゴリ別に重み付け平均
4. 総合スコア = 3カテゴリの単純平均

### カテゴリ別重み
- **子育て**: 小児科密度35% + 産婦人科20% + 夜間小児科15% + 薬局15% + 病院15%
- **高齢者**: 循環器25% + 整形外科25% + リハビリ25% + 病院密度25%
- **一般**: 内科25% + 歯科20% + 薬局20% + 診療所20% + 診療科多様性15%

### 面積データ
`scripts/calculate-district-scores.ts` の `TOKYO_23_WARD_AREA` に23区の面積(km²)を定義

## データ統計

- 施設総数: 20,927件（病院393、診療所9,381、歯科6,400、薬局4,753）
- 診療科数: 48,180件
- データ更新日: 2025年12月1日（厚労省公開日）

## 開発時の注意点

### 東京23区フィルタリング
`scripts/import-mhlw-tokyo.ts` の `extractWard()` で `address.startsWith('東京都')` を必ずチェック。
これがないと大阪市港区、名古屋市港区などの同名区が混入する。

### GeoJSON
区境界データは GitHub (smartnews-smri/japan-topography) から動的取得。
`TOKYO_23_WARD_CODES` で23区のみフィルタリング。

### スコアカラー
`src/lib/score-utils.ts` に集約済み：
- `getScoreColor()` - CSSクラス名
- `getScoreBgColor()` - 背景色CSSクラス
- `getScoreHexColor()` - HEXカラー（地図用）

### 施設タイプ
DBに保存される値: `病院`, `診療所`, `歯科`, `薬局`
（「歯科診療所」「助産所」ではない）

## API エンドポイント

- `GET /api/districts` - 全区スコア一覧
- `GET /api/scores/[district]` - 区別詳細スコア
- `GET /api/facilities/[district]` - 区別施設一覧

## トラブルシューティング

### スコアが全区同じになる
密度計算が正しくない可能性。`TOKYO_23_WARD_AREA` の面積データを確認。

### 特定区に他県データが混入
`extractWard()` の東京都チェックを確認。

### 地図が表示されない
- Leaflet CSSの読み込み確認
- SSR問題: `Tokyo23WardMapWrapper.tsx` で `dynamic(..., { ssr: false })` を使用

## 関連リンク

- 厚労省オープンデータ: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/johokokai/index.html
- GeoJSON: https://github.com/smartnews-smri/japan-topography
