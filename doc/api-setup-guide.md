# API設定ガイド

**最終更新**: 2025年12月15日

---

## 不動産情報ライブラリAPI（国土交通省）

### APIキーの取得

✅ **完了** - 2025年12月15日に承認されました

### APIキーの設定

APIキーは `.env` ファイルに保存されています。

```bash
# .env
REINFOLIB_API_KEY="YOUR_API_KEY_HERE"
```

**重要**: `.env` ファイルは `.gitignore` で除外されているため、Gitにコミットされません。

### APIの使用方法

**公式マニュアル**: https://www.reinfolib.mlit.go.jp/help/apiManual/

#### 基本的なエンドポイント

```
ベースURL: https://www.reinfolib.mlit.go.jp/ex-api/external
```

#### 主要API

1. **不動産取引価格情報取得API**
   - エンドポイント: `/XIT001`
   - 用途: 過去の不動産取引価格を取得

2. **地価公示情報取得API**
   - エンドポイント: `/XIT002`
   - 用途: 地価公示データを取得

#### リクエスト例（TypeScript）

```typescript
import axios from 'axios'

const API_KEY = process.env.REINFOLIB_API_KEY

// 不動産取引価格情報を取得
async function fetchRealEstateData(cityCode: string) {
  const response = await axios.get(
    'https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001',
    {
      params: {
        key: API_KEY,
        city: cityCode,
        from: '20241',  // 2024年第1四半期
        to: '20244',    // 2024年第4四半期
      }
    }
  )

  return response.data
}

// 浦安市の市区町村コード: 12227
const urayasuData = await fetchRealEstateData('12227')
```

#### レスポンス形式

XMLまたはJSON形式で取得可能（パラメータで指定）

```typescript
// JSON形式で取得
params: {
  key: API_KEY,
  city: '12227',
  from: '20241',
  to: '20244',
  format: 'json'  // JSON形式を指定
}
```

### 利用規約の遵守

**利用規約**: https://www.reinfolib.mlit.go.jp/help/termsOfUse/

#### 必須対応（Phase 1で実装）

1. **出典表示**
   ```
   「不動産取引価格情報（国土交通省）をもとにMediHome作成」
   ```

2. **免責事項**
   ```
   本サービスで表示される不動産取引価格は、国土交通省の過去の取引事例データに基づく参考情報です。
   不動産取引の最終判断には使用しないでください。
   ```

3. **APIキーの適切な管理**
   - 環境変数で管理（`.env` ファイル）
   - Gitにコミットしない（`.gitignore` で除外）
   - クライアントサイドに露出しない（サーバーサイドのみで使用）

### データ更新頻度

- **不動産取引価格情報**: 四半期ごとに更新
- **地価公示情報**: 年1回（1月1日時点の価格を3月に公表）

### 浦安市の市区町村コード

```
都道府県コード: 12 (千葉県)
市区町村コード: 12227 (浦安市)
```

---

## セキュリティ上の注意

### ⚠️ APIキーの取り扱い

1. **絶対にGitにコミットしない**
   - `.env` ファイルは `.gitignore` で除外済み
   - コード内に直接記載しない

2. **クライアントサイドに露出しない**
   - Next.jsのServer Actionsまたはサーバーサイドのみで使用
   - ブラウザのJavaScriptから直接APIを呼ばない

3. **環境変数の使用**
   ```typescript
   // ✅ OK: サーバーサイドで環境変数を使用
   const apiKey = process.env.REINFOLIB_API_KEY

   // ❌ NG: クライアントサイドに露出
   const apiKey = 'YOUR_API_KEY_HERE'
   ```

4. **本番環境での設定**
   - Cloudflare Pagesの環境変数に設定
   - ダッシュボードから設定（コードにコミットしない）

### APIキーが漏洩した場合

1. 国土交通省に連絡してAPIキーを再発行
2. `.env` ファイルを更新
3. 漏洩したキーを無効化

---

## Phase 1での実装計画

### スクリプト作成予定

1. **不動産データ取得スクリプト**
   ```
   scripts/fetch-real-estate-data.ts
   ```
   - 浦安市の過去1年間の取引データを取得
   - CSVまたはJSONで保存

2. **データインポートスクリプト**
   ```
   scripts/import-real-estate-data.ts
   ```
   - 取得したデータをSQLiteにインポート
   - 緯度経度の紐付け

3. **データ分析スクリプト**
   ```
   scripts/analyze-real-estate-data.ts
   ```
   - 価格帯の分析
   - エリア別の相場確認

### Phase 1実装優先順位

**Phase 1では医療データのみ実装**（ビジネスプランの方針）

不動産データは**Phase 2以降**で実装予定。APIキーは準備完了。

---

## トラブルシューティング

### API呼び出しエラー

#### 認証エラー（401 Unauthorized）
- APIキーが正しいか確認
- 環境変数が正しく読み込まれているか確認

#### レート制限エラー（429 Too Many Requests）
- 利用規約で定められたレート制限を確認
- リクエスト間隔を調整

#### データが取得できない
- 市区町村コードが正しいか確認（浦安市: `12227`）
- 期間指定が正しいか確認（`from`, `to` パラメータ）

---

**参考リンク**:
- [API利用マニュアル](https://www.reinfolib.mlit.go.jp/help/apiManual/)
- [利用規約](https://www.reinfolib.mlit.go.jp/help/termsOfUse/)
- [不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)
