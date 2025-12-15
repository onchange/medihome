import Link from 'next/link'

async function getDistrictData(district: string) {
  const [scoresRes, realEstateRes] = await Promise.all([
    fetch(`http://localhost:4000/api/scores/${encodeURIComponent(district)}`, {
      cache: 'no-store'
    }),
    fetch(`http://localhost:4000/api/real-estate/${encodeURIComponent(district)}`, {
      cache: 'no-store'
    })
  ])

  const scores = scoresRes.ok ? await scoresRes.json() : null
  const realEstate = realEstateRes.ok ? await realEstateRes.json() : null

  return { scores, realEstate }
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ district?: string }>
}) {
  const { district } = await searchParams

  if (!district) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← トップページに戻る
          </Link>
          <p>地区が指定されていません</p>
        </div>
      </div>
    )
  }

  const { scores, realEstate } = await getDistrictData(district)

  if (!scores) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← トップページに戻る
          </Link>
          <p>地区データが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← トップページに戻る
        </Link>

        <h1 className="text-3xl font-bold mb-8">{district}エリア</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">医療アクセススコア</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded">
                  <span className="font-bold">総合スコア</span>
                  <span className="text-3xl font-bold text-blue-600">{scores.score.overallScore}点</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>子育てスコア</span>
                    <span className="font-bold text-lg">{scores.score.childcareScore}点</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>高齢者スコア</span>
                    <span className="font-bold text-lg">{scores.score.elderlyScore}点</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>一般医療スコア</span>
                    <span className="font-bold text-lg">{scores.score.generalScore}点</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">施設数</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">病院</div>
                  <div className="text-2xl font-bold">{scores.score.hospitalCount}件</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">診療所</div>
                  <div className="text-2xl font-bold">{scores.score.clinicCount}件</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">歯科</div>
                  <div className="text-2xl font-bold">{scores.score.dentalCount}件</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">薬局</div>
                  <div className="text-2xl font-bold">{scores.score.pharmacyCount}件</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {realEstate && realEstate.count > 0 ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4">不動産相場（2024年）</h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded">
                      <div className="text-sm text-gray-600 mb-1">取引件数</div>
                      <div className="text-2xl font-bold text-green-600">{realEstate.count}件</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>平均価格</span>
                        <span className="font-bold text-lg">{(realEstate.avgPrice / 10000).toFixed(0)}万円</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span>中央値</span>
                        <span className="font-bold text-lg">{(realEstate.medianPrice / 10000).toFixed(0)}万円</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4">最近の取引例（最大10件）</h3>
                  <div className="space-y-2">
                    {realEstate.transactions.slice(0, 10).map((tx: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{tx.propertyType}</span>
                          <span className="font-bold text-blue-600">{(tx.tradePrice / 10000).toFixed(0)}万円</span>
                        </div>
                        <div className="text-gray-600">
                          {tx.floorPlan && <span>{tx.floorPlan} / </span>}
                          {tx.area}㎡
                          {tx.buildingYear && <span> / {tx.buildingYear}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">不動産相場</h2>
                <p className="text-gray-600">この地区の不動産取引データはありません</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 space-y-2">
          <p>※ スコアは施設の数と距離を基に自動計算しています。医療サービスの質を保証するものではありません。</p>
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
