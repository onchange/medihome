import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { execSync } from 'child_process'

const BASE_URL = 'https://www.mhlw.go.jp/content/11121000'
const DATA_DATE = '20251201'

const FILES = [
  { name: 'hospital_facility', url: `${BASE_URL}/01-1_hospital_facility_info_${DATA_DATE}.zip` },
  { name: 'hospital_hours', url: `${BASE_URL}/01-2_hospital_speciality_hours_${DATA_DATE}.zip` },
  { name: 'clinic_facility', url: `${BASE_URL}/02-1_clinic_facility_info_${DATA_DATE}.zip` },
  { name: 'clinic_hours', url: `${BASE_URL}/02-2_clinic_speciality_hours_${DATA_DATE}.zip` },
  { name: 'dental_facility', url: `${BASE_URL}/03-1_dental_facility_info_${DATA_DATE}.zip` },
  { name: 'dental_hours', url: `${BASE_URL}/03-2_dental_speciality_hours_${DATA_DATE}.zip` },
  { name: 'pharmacy', url: `${BASE_URL}/05_pharmacy_${DATA_DATE}.zip` },
]

async function downloadFile(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`  ダウンロード中: ${path.basename(url)}`)
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MediHome/1.0)',
      },
    })
    fs.writeFileSync(outputPath, response.data)
    console.log(`  ✅ 保存完了: ${outputPath}`)
    return true
  } catch (error: any) {
    console.error(`  ❌ ダウンロード失敗: ${error.message}`)
    return false
  }
}

async function extractZip(zipPath: string, outputDir: string): Promise<void> {
  try {
    execSync(`unzip -o "${zipPath}" -d "${outputDir}"`, { stdio: 'pipe' })
    console.log(`  ✅ 解凍完了: ${path.basename(zipPath)}`)
  } catch (error) {
    console.error(`  ❌ 解凍失敗: ${zipPath}`)
  }
}

async function fetchMhlwOpendata() {
  console.log('📥 厚労省医療情報ネット オープンデータのダウンロード開始\n')
  console.log(`データ日付: ${DATA_DATE}\n`)

  const dataDir = path.join(process.cwd(), 'data', 'mhlw')
  const zipDir = path.join(dataDir, 'zip')
  const csvDir = path.join(dataDir, 'csv')

  fs.mkdirSync(zipDir, { recursive: true })
  fs.mkdirSync(csvDir, { recursive: true })

  console.log('=== ZIPファイルのダウンロード ===\n')

  for (const file of FILES) {
    const zipPath = path.join(zipDir, `${file.name}.zip`)
    const success = await downloadFile(file.url, zipPath)

    if (success) {
      await extractZip(zipPath, csvDir)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('\n=== ダウンロード完了 ===\n')
  console.log(`ZIPファイル: ${zipDir}`)
  console.log(`CSVファイル: ${csvDir}`)

  const csvFiles = fs.readdirSync(csvDir).filter((f) => f.endsWith('.csv'))
  console.log(`\n見つかったCSVファイル: ${csvFiles.length}件`)
  csvFiles.forEach((f) => console.log(`  - ${f}`))

  console.log('\n次のステップ:')
  console.log('npm run import:mhlw を実行してデータをインポートしてください')
}

fetchMhlwOpendata().catch(console.error)
