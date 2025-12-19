import * as fs from 'fs'
import * as path from 'path'

async function downloadMedicalData() {
  console.log('📥 厚労省オープンデータ（実データ）を確認中...\n')

  const dataDir = path.join(process.cwd(), 'data', 'raw')
  fs.mkdirSync(dataDir, { recursive: true })

  const facilityFile = path.join(dataDir, 'urayasu_clinics_real.csv')
  const hoursFile = path.join(dataDir, 'urayasu_hours_real.csv')

  if (fs.existsSync(facilityFile) && fs.existsSync(hoursFile)) {
    console.log('  ✅ 実データファイル確認完了')
    console.log(`     施設情報: ${facilityFile}`)
    console.log(`     診療科・時間: ${hoursFile}`)

    const facilityLines = fs.readFileSync(facilityFile, 'utf-8').split('\n').length - 1
    const hoursLines = fs.readFileSync(hoursFile, 'utf-8').split('\n').length - 1

    console.log(`\n  📊 データ件数:`)
    console.log(`     施設: ${facilityLines - 1}件`)
    console.log(`     診療科レコード: ${hoursLines - 1}件`)
  } else {
    console.error('  ❌ 実データファイルが見つかりません')
    console.error('\n  以下のファイルを確認してください:')
    console.error(`    - ${facilityFile}`)
    console.error(`    - ${hoursFile}`)
    process.exit(1)
  }

  console.log('\n✅ データ確認完了！')
  console.log(`📁 保存先: ${dataDir}\n`)
  console.log('💡 次のステップ:')
  console.log('   npm run phase0:import')
}

downloadMedicalData().catch(console.error)
