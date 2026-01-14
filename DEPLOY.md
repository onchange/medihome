# Cloudflare Pagesデプロイ手順

このドキュメントでは、MediHomeをCloudflare Pagesにデプロイする手順を説明します。

## 前提条件

- Cloudflareアカウント
- GitHubリポジトリとの連携
- Node.js 20以上

## デプロイ方法

### 方法1: GitHub連携による自動デプロイ（推奨）

#### 1. Cloudflare Pagesプロジェクトを作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)にログイン
2. 左メニューから「Pages」を選択
3. 「Create a project」をクリック
4. 「Connect to Git」を選択
5. GitHubリポジトリ（medihome）を選択

#### 2. ビルド設定

以下の設定を入力：

```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (空欄)
Node version: 20
```

環境変数:
```
NODE_VERSION=20
```

#### 3. デプロイ実行

「Save and Deploy」をクリックしてデプロイを開始します。

### 方法2: Wrangler CLIを使用したデプロイ

#### 1. Wranglerのインストール

```bash
npm install -g wrangler
```

#### 2. Cloudflareにログイン

```bash
wrangler login
```

#### 3. ビルド

```bash
npm run build
```

#### 4. デプロイ

```bash
wrangler pages deploy .next
```

## データベース設定（Cloudflare D1）

### 1. D1データベースの作成

```bash
wrangler d1 create medihome-db
```

出力される`database_id`をメモしておきます。

### 2. スキーマのセットアップ

```bash
wrangler d1 execute medihome-db --file=./scripts/setup-cloudflare-d1.sql
```

### 3. データのインポート

#### SQLiteからD1へのデータ移行

ローカルのSQLiteデータベースからCloudflare D1にデータを移行します：

```bash
# SQLiteからSQLダンプを作成
sqlite3 prisma/dev.db .dump > dump.sql

# D1にインポート
wrangler d1 execute medihome-db --file=dump.sql
```

### 4. wrangler.tomlの更新

`wrangler.toml`ファイルのD1設定を更新：

```toml
[[d1_databases]]
binding = "DB"
database_name = "medihome-db"
database_id = "あなたのdatabase_id"
```

## 環境変数の設定

Cloudflare Pagesのダッシュボードで以下の環境変数を設定：

### 必須環境変数

```
REINFOLIB_API_KEY=あなたのAPIキー
DATABASE_URL=Cloudflare D1の接続文字列
```

設定方法：
1. Cloudflare Pages ダッシュボード
2. プロジェクトを選択
3. 「Settings」→「Environment variables」
4. 変数を追加

## 現在の制限事項

### Next.js 16の対応状況

現在、`@cloudflare/next-on-pages`はNext.js 16に未対応です（Next.js 15まで対応）。

以下の選択肢があります：

#### オプション1: Next.js 15にダウングレード（推奨）

```bash
npm install next@15 react@19 react-dom@19
npm install -D @cloudflare/next-on-pages wrangler
```

#### オプション2: 静的エクスポート

APIルートを使わない静的サイトとしてエクスポート：

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

**注意**: この方法ではAPIルート（`/api/*`）が使用できなくなります。

#### オプション3: Vercelを使用

Next.js 16を完全にサポートしているVercelにデプロイする方法もあります。

## デプロイ後の確認

1. デプロイが完了したら、Cloudflare Pagesから提供されるURLにアクセス
2. 地図が正常に表示されることを確認
3. データベース接続を確認
4. 各APIエンドポイントの動作確認

## トラブルシューティング

### ビルドエラー

- Node.jsバージョンを確認（20以上必要）
- `package-lock.json`を削除して再インストール
- キャッシュをクリア

### データベース接続エラー

- D1のdatabase_idが正しいか確認
- 環境変数が正しく設定されているか確認
- スキーマが正しくセットアップされているか確認

### 地図が表示されない

- LeafletのCSSが読み込まれているか確認
- ブラウザのコンソールでエラーを確認

## カスタムドメインの設定

1. Cloudflare Pagesダッシュボード
2. 「Custom domains」を選択
3. ドメインを追加
4. DNSレコードを設定

## 参考リンク

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Next.js デプロイガイド](https://nextjs.org/docs/app/building-your-application/deploying)
