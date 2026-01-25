import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getScoreColor, getScoreBgColor } from '@/lib/score-utils'
import { District } from '@/types'
import DistrictFilter from '@/components/DistrictFilter'
import Tokyo23WardMapWrapper from '@/components/Tokyo23WardMapWrapper'

async function getDistricts(): Promise<District[]> {
  try {
    const districts = await prisma.districtMedicalScore.findMany({
      orderBy: { overallScore: 'desc' },
      select: {
        id: true,
        districtName: true,
        childcareScore: true,
        elderlyScore: true,
        generalScore: true,
        overallScore: true,
        hospitalCount: true,
        clinicCount: true,
        dentalCount: true,
        pharmacyCount: true,
      },
    })
    return districts
  } catch (error) {
    console.error('Error fetching districts:', error)
    return []
  }
}

export default async function Home() {
  const districts = await getDistricts()
  const top5 = districts.slice(0, 5)
  const worst5 = [...districts].sort((a, b) => a.overallScore - b.overallScore).slice(0, 5)

  const totalFacilities = districts.reduce(
    (sum, d) => sum + d.hospitalCount + d.clinicCount + d.dentalCount + d.pharmacyCount,
    0
  )
  const avgScore = districts.length > 0
    ? Math.round(districts.reduce((sum, d) => sum + d.overallScore, 0) / districts.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">東京23区 医療アクセス格差マップ</h1>
          <p className="text-xl text-blue-100">
            あなたの街の医療環境を可視化
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">対象地区数</p>
              <p className="text-3xl font-bold text-blue-600">{districts.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">医療施設総数</p>
              <p className="text-3xl font-bold text-blue-600">{totalFacilities}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">平均医療スコア</p>
              <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-12">
          <h2 className="text-xl font-bold mb-4">23区医療アクセスマップ</h2>
          <p className="text-sm text-gray-600 mb-4">区をクリックすると詳細を表示できます</p>
          <Tokyo23WardMapWrapper districts={districts} className="h-[450px]" />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              医療アクセスTOP5
            </h2>
            <ul className="space-y-3">
              {top5.map((d, i) => (
                <li key={d.id} className={`flex justify-between items-center p-3 rounded border ${getScoreBgColor(d.overallScore)}`}>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-6">{i + 1}.</span>
                    <Link href={`/search?district=${encodeURIComponent(d.districtName)}`} className="text-blue-600 hover:underline font-medium">
                      {d.districtName}
                    </Link>
                  </div>
                  <span className={`font-bold ${getScoreColor(d.overallScore)}`}>{d.overallScore}点</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              医療アクセスWORST5
            </h2>
            <ul className="space-y-3">
              {worst5.map((d, i) => (
                <li key={d.id} className={`flex justify-between items-center p-3 rounded border ${getScoreBgColor(d.overallScore)}`}>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-6">{i + 1}.</span>
                    <Link href={`/search?district=${encodeURIComponent(d.districtName)}`} className="text-blue-600 hover:underline font-medium">
                      {d.districtName}
                    </Link>
                  </div>
                  <span className={`font-bold ${getScoreColor(d.overallScore)}`}>{d.overallScore}点</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-12">
          <h2 className="text-xl font-bold mb-4">全地区スコア一覧</h2>
          <DistrictFilter districts={districts} />
        </section>

        <footer className="text-sm text-gray-500 space-y-2 border-t pt-8">
          <p>データ出典: 厚生労働省医療情報ネット</p>
          <nav className="space-x-4" aria-label="法的情報">
            <Link href="/legal/scoring" className="text-blue-600 hover:underline">
              スコア計算ロジック
            </Link>
            <Link href="/legal/disclaimer" className="text-blue-600 hover:underline">
              免責事項
            </Link>
            <Link href="/legal/attribution" className="text-blue-600 hover:underline">
              データ出典
            </Link>
          </nav>
        </footer>
      </main>
    </div>
  )
}
