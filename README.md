# MediHome

**東京23区 医療アクセス格差マップ**

東京23区の医療アクセス格差を可視化するWebサービスです。子育て・高齢者・一般医療の3つの視点から医療環境を評価し、引っ越し先選びの参考情報を提供します。

## 機能

- 23区の医療アクセススコア表示（地図上で色分け）
- ライフステージ別フィルター（子育て/高齢者/一般）
- 区別ランキング（TOP5 / WORST5）
- 医療施設一覧と詳細情報

## データ

- **データソース**: 厚生労働省 医療情報ネット オープンデータ
- **対象エリア**: 東京23区
- **施設数**: 20,927施設（病院393、診療所9,381、歯科6,400、薬局4,753）
- **診療科数**: 48,180件
- **データ更新日**: 2025年12月1日

## 技術スタック

- Next.js 16（App Router）
- TypeScript / React 19
- Prisma + SQLite
- Leaflet + OpenStreetMap
- TailwindCSS v4

## セットアップ

```bash
# 依存関係インストール
npm install

# データセットアップ（ダウンロード→インポート→スコア計算）
npm run setup:mhlw

# 開発サーバー起動
npm run dev
```

開発サーバー: http://localhost:4000

## npm スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run setup:mhlw` | データセットアップ一括実行 |
| `npm run db:studio` | Prisma Studio |

## ライセンス

- 医療施設情報: [厚生労働省 医療情報ネット](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/johokokai/index.html)（政府標準利用規約 第2.0版）
- 地図: [OpenStreetMap](https://www.openstreetmap.org/)（ODbL）

## 免責事項

本サービスの情報は参考情報です。医療機関の最新情報は各医療機関に直接ご確認ください。
