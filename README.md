# MediHome

**医療アクセス × 不動産 統合分析プラットフォーム**

MediHomeは、住所を入力すると周辺の医療環境を3つの視点（子育て・高齢者・一般医療）から評価し、不動産価格と合わせて表示するWebサービスです。

## プロジェクトステータス

- **Phase 0（データ探索・検証）**: ✅ 完了（2025年12月14日）
- **Phase 1（MVP本実装）**: 準備完了

## Phase 0 完了サマリー

### 取得データ

- **医療施設データ**: 浦安市 198件（2025年12月1日時点）
  - 病院: 5件
  - 診療所: 73件
  - 歯科診療所: 60件
  - 助産所: 2件
  - 薬局: 58件
  - 診療科・時間レコード: 615件

- **不動産取引データ**: 浦安市 563件（2024年度）
  - 第1四半期: 179件
  - 第2四半期: 122件
  - 第3四半期: 117件
  - 第4四半期: 145件
  - 平均取引価格: 6,194万円
  - 主要物件タイプ: 中古マンション74%

### データ品質

- ✅ 緯度経度: 100%カバー（ジオコーディング不要）
- ✅ Webサイト情報: 約70%
- ✅ 欠損値: なし
- ✅ 診療科データ: 豊富（615レコード）

### ライセンス

- 医療データ: 厚生労働省 医療情報ネット（PDL1.0）
- 不動産データ: 国土交通省 不動産情報ライブラリ（PDL1.0、✅ API承認完了）
- 商用利用: ✅ 可能（出典記載必須）

## 技術スタック

### フロントエンド
- Next.js 16.0.10（App Router）
- TypeScript
- React 19.2.1
- Leaflet + React Leaflet（地図表示・✅ 実装済み）
- TailwindCSS v4

### バックエンド・データベース
- Prisma ORM 5.7.0
- SQLite（開発環境）
- Cloudflare D1（本番環境・予定）

### デプロイ
- Cloudflare Pages（予定）

### 開発ツール
- tsx（TypeScript実行）
- csv-parse（CSVパース）

## ディレクトリ構成

```
medihome/
├── data/
│   ├── raw/                          # 生データ（医療施設CSV）
│   │   ├── urayasu_hospitals.csv     # 病院（5件）
│   │   ├── urayasu_clinics_real.csv  # 診療所（73件）
│   │   ├── urayasu_dental.csv        # 歯科（60件）
│   │   ├── urayasu_maternity.csv     # 助産所（2件）
│   │   ├── urayasu_pharmacy.csv      # 薬局（58件）
│   │   └── urayasu_hours_real.csv    # 診療科・時間（615件）
│   ├── real-estate/                  # 不動産取引データ（JSON）
│   │   ├── urayasu_transactions_2024_q1.json  # 第1四半期（179件）
│   │   ├── urayasu_transactions_2024_q2.json  # 第2四半期（122件）
│   │   ├── urayasu_transactions_2024_q3.json  # 第3四半期（117件）
│   │   └── urayasu_transactions_2024_q4.json  # 第4四半期（145件）
│   └── opendata/                      # 元データ（ZIP解凍後）
├── scripts/
│   ├── phase0-download-data.ts       # 医療データ確認
│   ├── phase0-import-raw.ts          # 医療データDBインポート
│   ├── phase0-analyze-data.ts        # 医療データ分析
│   ├── fetch-real-estate-data.ts     # 不動産データ取得
│   └── analyze-real-estate-data.ts   # 不動産データ分析
├── prisma/
│   ├── schema.prisma                 # 探索用スキーマ
│   └── dev.db                        # SQLite（73件インポート済み）
├── doc/
│   ├── medihome-business-plan-v3.md       # ビジネスプラン
│   ├── phase0-completion-report.md        # Phase 0完了レポート
│   ├── data-structure-reference.md        # データ構造リファレンス
│   ├── real-estate-data-analysis.md       # 不動産データ分析レポート
│   ├── legal-compliance-checklist.md      # 法的コンプライアンス
│   └── api-setup-guide.md                 # API設定ガイド
└── README.md                               # 本ファイル
```

## Phase 0 スクリプト

### データ確認

```bash
npm run phase0:download
```

実データファイルの存在確認と件数表示。

### データインポート

```bash
npm run phase0:import
```

73件の診療所データをSQLiteにインポート。施設情報と診療科情報を統合。

### データ分析

```bash
npm run phase0:analyze
```

診療科分布、座標データ、施設タイプなどを分析。

### 一括実行

```bash
npm run phase0:all
```

上記3つを順次実行。

### 不動産データ取得

```bash
npm run fetch:realestate
```

不動産情報ライブラリAPIから浦安市の2024年度データを取得（563件）。

### 不動産データ分析

```bash
npm run analyze:realestate
```

取得済み不動産データの統計分析（物件タイプ、地区別分布、価格帯など）。

## データベース管理

### Prisma Studio

```bash
npm run db:studio
```

Prisma Studioでデータベースを可視化（http://localhost:5555）

### スキーマ反映

```bash
npm run db:push
```

Prismaスキーマの変更をSQLiteに反映。

## 開発サーバー

```bash
npm run dev
```

開発サーバーを起動（http://localhost:4000）

地図表示には**Leaflet**（完全無料のOSS）と**OpenStreetMap**を使用しているため、APIキーの設定は不要です。

## Phase 1（MVP本実装）完了状況

✅ **Phase 1は完了しました！**（2025年12月19日）

### 実装済み機能

1. ✅ **データベース基盤**
   - 全施設タイプ統合（病院・診療所・歯科・助産所・薬局）
   - 198医療施設データ + 563不動産取引データ

2. ✅ **スコア計算ロジック**
   - 子育てスコア（小児科、夜間診療、産婦人科）
   - 高齢者スコア（循環器内科、整形外科、リハビリ科）
   - 一般医療スコア（内科、診療科多様性、歯科）

3. ✅ **フロントエンド**
   - 地区選択インターフェース
   - **地図表示（Leaflet + OpenStreetMap）** - 医療施設の位置と詳細をインタラクティブに表示（APIキー不要）
   - スコアカード詳細表示
   - ニーズ別フィルタ機能
   - 医療施設一覧とGoogle Mapsリンク

4. ✅ **必須ページ**
   - トップページ
   - 検索結果ページ
   - 出典・免責事項ページ

### 現在の状態

- ✅ ローカル環境（SQLite）で完全動作
- ✅ 浦安市21地区で全機能実装
- ✅ M3面接でデモ可能
- ✅ ビルド成功

## 次のステップ（Phase 2以降）

Phase 1が完了し、基本機能が実装されました。今後の拡張可能性：

1. **住所検索フォーム**
   - ジオコーディングAPIとの連携
   - 自由入力での住所検索

2. **他都市への展開**
   - 全国の医療施設データ取り込み
   - 地域選択機能

3. **デプロイ**
   - Cloudflare Pagesへのデプロイ
   - Cloudflare D1への移行

4. **追加機能**
   - ユーザーレビュー機能
   - お気に入り保存機能
   - 比較機能（複数地区の比較）

## ライセンス表示

本サービスは以下のオープンデータを利用しています：

- 医療施設情報: [医療情報ネット（厚生労働省）](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/teikyouseido/index.html)
- 不動産取引情報: 不動産取引価格情報（国土交通省）をもとにMediHome作成
- 地図表示: [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)

## 免責事項

- 本サービスの情報は参考情報です
- 医療機関の最新情報は各医療機関に直接ご確認ください
- 不動産取引の最終判断には使用しないでください

## 開発者

個人開発プロジェクト（M3転職申請用）
