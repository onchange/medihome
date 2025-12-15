import Link from 'next/link'

async function getDistricts() {
  const res = await fetch('http://localhost:4000/api/districts', {
    cache: 'no-store'
  })
  if (!res.ok) return []
  return res.json()
}

export default async function Home() {
  const districts = await getDistricts()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">
          MediHome - 医療アクセス × 不動産相場
        </h1>
        <p className="text-gray-600 mb-8">
          浦安市の医療施設と不動産相場を地区別に比較できます
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">地区を選択</h2>
          <p className="text-gray-600 mb-4">
            医療アクセススコアと不動産相場を確認したい地区を選択してください
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map((district: any) => (
              <Link
                key={district.id}
                href={`/search?district=${encodeURIComponent(district.districtName)}`}
                className="block p-4 border rounded hover:bg-gray-50 hover:border-blue-500 transition-colors"
              >
                <div className="font-bold text-lg mb-2">{district.districtName}</div>
                <div className="text-sm text-gray-600">
                  総合スコア: <span className="font-bold text-blue-600">{district.overallScore}点</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  子育て{district.childcareScore}点 / 高齢者{district.elderlyScore}点 / 一般{district.generalScore}点
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500 space-y-2">
          <p>データ出典: 厚生労働省医療情報ネット、国土交通省不動産情報ライブラリ</p>
          <div className="space-x-4">
            <Link href="/legal/disclaimer" className="text-blue-600 hover:underline">
              免責事項
            </Link>
            <Link href="/legal/attribution" className="text-blue-600 hover:underline">
              データ出典
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
