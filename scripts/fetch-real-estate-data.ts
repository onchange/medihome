import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.REINFOLIB_API_KEY
const BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external'

interface RealEstateParams {
  key: string
  city: string
  year: string
  quarter: string
}

async function fetchRealEstateData() {
  console.log('📥 不動産情報ライブラリAPIから浦安市のデータを取得中...\n')

  if (!API_KEY) {
    console.error('❌ エラー: REINFOLIB_API_KEY が設定されていません')
    console.error('   .env ファイルを確認してください')
    process.exit(1)
  }

  const dataDir = path.join(process.cwd(), 'data', 'real-estate')
  fs.mkdirSync(dataDir, { recursive: true })

  const year = '2024'
  const quarters = ['1', '2', '3', '4']

  for (const quarter of quarters) {
    const params: RealEstateParams = {
      key: API_KEY,
      city: '12227',
      year: year,
      quarter: quarter,
    }

    console.log(`📊 リクエストパラメータ (${year}年第${quarter}四半期):`)
    console.log(`   市区町村コード: ${params.city} (浦安市)`)
    console.log(`   年: ${params.year}`)
    console.log(`   四半期: ${params.quarter}`)
    console.log()

    try {
      const response = await axios.get(`${BASE_URL}/XIT001`, {
        params,
        timeout: 30000,
      })

      console.log(`✅ データ取得成功 (${year}年第${quarter}四半期)`)
      console.log(`   ステータス: ${response.status}`)
      console.log(`   Content-Type: ${response.headers['content-type']}`)
      console.log()

      const outputJson = path.join(dataDir, `urayasu_transactions_${year}_q${quarter}.json`)
      const jsonData = JSON.stringify(response.data, null, 2)
      fs.writeFileSync(outputJson, jsonData, 'utf-8')
      console.log(`💾 JSONファイルに保存: ${outputJson}`)

      if (quarter === '4') {
        const lines = jsonData.split('\n').slice(0, 50)
        console.log('\n📄 データの先頭50行 (第4四半期):')
        console.log('─'.repeat(80))
        console.log(lines.join('\n'))
        console.log('─'.repeat(80))
      }

      if (response.data && response.data.data) {
        const transactionCount = Array.isArray(response.data.data) ? response.data.data.length : 0
        console.log(`📊 取引件数: ${transactionCount}件`)
      }

      console.log()

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ APIリクエストエラー (${year}年第${quarter}四半期):`)
        console.error(`   ステータス: ${error.response?.status}`)
        console.error(`   メッセージ: ${error.message}`)
        if (error.response?.data) {
          console.error(`   レスポンス: ${JSON.stringify(error.response.data, null, 2)}`)
        }
      } else {
        console.error('❌ エラー:', error)
      }
      console.log()
    }
  }

  console.log('✅ 全四半期のデータ取得完了')
}

fetchRealEstateData()
