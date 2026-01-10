import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { RealEstateTransaction, sanitizeDistrict, isValidDistrict } from '@/types'
import FacilityMapSection from '@/components/FacilityMapSection'

interface MedicalFacility {
  id: string
  name: string
  facilityType: string
  address: string
  latitude: number
  longitude: number
  departments: { departmentName: string }[]
}

interface ScoreDetailsData {
  childcare: {
    pediatricsCount: number
    hasNightPediatrics: boolean
    maternityCount: number
    hasNearbyHospital: boolean
    pharmacyCount: number
  }
  elderly: {
    cardiologyCount: number
    orthopedicsCount: number
    rehabCount: number
    homeVisitCount: number
    hasNearbyHospital: boolean
  }
  general: {
    internalMedicineCount: number
    departmentVariety: number
    dentalCount: number
    hasNearbyHospital: boolean
    pharmacyCount: number
  }
}

interface DistrictData {
  score: {
    id: string
    districtName: string
    childcareScore: number
    elderlyScore: number
    generalScore: number
    overallScore: number
    hospitalCount: number
    clinicCount: number
    dentalCount: number
    pharmacyCount: number
    scoreDetails: string
  } | null
  details: ScoreDetailsData | null
  facilities: MedicalFacility[]
  realEstate: {
    count: number
    avgPrice: number
    medianPrice: number
    transactions: RealEstateTransaction[]
  } | null
}

async function getDistrictData(districtName: string): Promise<DistrictData> {
  try {
    const [score, transactions, facilities] = await Promise.all([
      prisma.districtMedicalScore.findUnique({
        where: { districtName },
      }),
      prisma.realEstateTransaction.findMany({
        where: { districtName },
        orderBy: { tradePrice: 'asc' },
        take: 50,
      }),
      prisma.medicalFacility.findMany({
        where: { districtName },
        include: {
          departments: {
            select: { departmentName: true },
          },
        },
        orderBy: { facilityType: 'asc' },
      }),
    ])

    let details: ScoreDetailsData | null = null
    if (score?.scoreDetails) {
      try {
        details = JSON.parse(score.scoreDetails)
      } catch {
        console.warn('Failed to parse scoreDetails')
      }
    }

    let realEstate = null
    if (transactions.length > 0) {
      const prices = transactions.map((t) => t.tradePrice)
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      const medianPrice = prices[Math.floor(prices.length / 2)]
      realEstate = {
        count: transactions.length,
        avgPrice,
        medianPrice,
        transactions: transactions as RealEstateTransaction[],
      }
    }

    return { score, details, facilities, realEstate }
  } catch (error) {
    console.error('Error fetching district data:', error)
    return { score: null, details: null, facilities: [], realEstate: null }
  }
}

function CheckIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <span className="text-green-600">○</span>
  ) : (
    <span className="text-gray-400">-</span>
  )
}

function getGoogleMapsUrl(facility: MedicalFacility): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + ' ' + facility.address)}`
}

function getFacilityTypeLabel(type: string): string {
  switch (type) {
    case '病院':
      return '🏥 病院'
    case '診療所':
      return '🩺 診療所'
    case '歯科':
      return '🦷 歯科'
    case '薬局':
      return '💊 薬局'
    default:
      return type
  }
}

function getFacilityTypeBgColor(type: string): string {
  switch (type) {
    case '病院':
      return 'bg-red-50 border-red-200'
    case '診療所':
      return 'bg-blue-50 border-blue-200'
    case '歯科':
      return 'bg-green-50 border-green-200'
    case '薬局':
      return 'bg-yellow-50 border-yellow-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string }>
}) {
  const { district: rawDistrict } = await searchParams

  if (!rawDistrict) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← トップページに戻る
          </Link>
          <div role="alert" className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p>地区が指定されていません</p>
          </div>
        </div>
      </div>
    )
  }

  const district = sanitizeDistrict(rawDistrict)

  if (!isValidDistrict(district)) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← トップページに戻る
          </Link>
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded">
            <p>無効な地区名です</p>
          </div>
        </div>
      </div>
    )
  }

  const { score, details, facilities, realEstate } = await getDistrictData(district)

  if (!score) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← トップページに戻る
          </Link>
          <div role="alert" className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p>地区データが見つかりません</p>
          </div>
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

        <div className="mb-8">
          <FacilityMapSection district={district} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6" aria-labelledby="score-heading">
              <h2 id="score-heading" className="text-2xl font-bold mb-4">医療アクセススコア</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded">
                  <span className="font-bold">総合スコア</span>
                  <span
                    className="text-3xl font-bold text-blue-600"
                    role="status"
                    aria-label={`総合スコア: ${score.overallScore}点`}
                  >
                    {score.overallScore}点
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="border rounded overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-pink-50">
                      <span className="font-bold text-pink-800">子育てスコア</span>
                      <span className="font-bold text-lg text-pink-600">{score.childcareScore}点</span>
                    </div>
                    {details?.childcare && (
                      <div className="p-3 text-sm space-y-1 bg-white">
                        <div className="flex justify-between">
                          <span className="text-gray-600">小児科</span>
                          <span className="font-medium">{details.childcare.pediatricsCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">夜間小児科</span>
                          <CheckIcon checked={details.childcare.hasNightPediatrics} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">産婦人科・助産所</span>
                          <span className="font-medium">{details.childcare.maternityCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">1km以内に病院</span>
                          <CheckIcon checked={details.childcare.hasNearbyHospital} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">薬局3件以上</span>
                          <CheckIcon checked={details.childcare.pharmacyCount >= 3} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-purple-50">
                      <span className="font-bold text-purple-800">高齢者スコア</span>
                      <span className="font-bold text-lg text-purple-600">{score.elderlyScore}点</span>
                    </div>
                    {details?.elderly && (
                      <div className="p-3 text-sm space-y-1 bg-white">
                        <div className="flex justify-between">
                          <span className="text-gray-600">循環器内科</span>
                          <span className="font-medium">{details.elderly.cardiologyCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">整形外科</span>
                          <span className="font-medium">{details.elderly.orthopedicsCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">リハビリ科</span>
                          <span className="font-medium">{details.elderly.rehabCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">訪問診療対応</span>
                          <span className="font-medium">{details.elderly.homeVisitCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">1km以内に病院</span>
                          <CheckIcon checked={details.elderly.hasNearbyHospital} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-teal-50">
                      <span className="font-bold text-teal-800">一般医療スコア</span>
                      <span className="font-bold text-lg text-teal-600">{score.generalScore}点</span>
                    </div>
                    {details?.general && (
                      <div className="p-3 text-sm space-y-1 bg-white">
                        <div className="flex justify-between">
                          <span className="text-gray-600">内科</span>
                          <span className="font-medium">{details.general.internalMedicineCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">診療科の多様性</span>
                          <span className="font-medium">{details.general.departmentVariety}種類</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">歯科</span>
                          <span className="font-medium">{details.general.dentalCount}件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">1km以内に病院</span>
                          <CheckIcon checked={details.general.hasNearbyHospital} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">薬局3件以上</span>
                          <CheckIcon checked={details.general.pharmacyCount >= 3} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow p-6" aria-labelledby="facility-heading">
              <h3 id="facility-heading" className="text-xl font-bold mb-4">施設数</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">病院</div>
                  <div className="text-2xl font-bold">{score.hospitalCount}件</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">診療所</div>
                  <div className="text-2xl font-bold">{score.clinicCount}件</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">歯科</div>
                  <div className="text-2xl font-bold">{score.dentalCount}件</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">薬局</div>
                  <div className="text-2xl font-bold">{score.pharmacyCount}件</div>
                </div>
              </div>
            </section>

            {facilities.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6" aria-labelledby="facilities-list-heading">
                <h3 id="facilities-list-heading" className="text-xl font-bold mb-4">医療施設一覧</h3>
                <p className="text-sm text-gray-600 mb-4">
                  施設名をクリックするとGoogle Mapsで場所を確認できます
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className={`p-3 border rounded ${getFacilityTypeBgColor(facility.facilityType)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <a
                            href={getGoogleMapsUrl(facility)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline block truncate"
                            title={facility.name}
                          >
                            {facility.name}
                          </a>
                          <div className="text-xs text-gray-500 mt-1">{facility.address}</div>
                          {facility.departments.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              {facility.departments.map((d) => d.departmentName).join('、')}
                            </div>
                          )}
                        </div>
                        <span className="text-xs whitespace-nowrap">
                          {getFacilityTypeLabel(facility.facilityType)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            {realEstate && realEstate.count > 0 ? (
              <>
                <section className="bg-white rounded-lg shadow p-6" aria-labelledby="realestate-heading">
                  <h2 id="realestate-heading" className="text-2xl font-bold mb-4">不動産相場（2024年）</h2>

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
                </section>

                <section className="bg-white rounded-lg shadow p-6" aria-labelledby="transactions-heading">
                  <h3 id="transactions-heading" className="text-xl font-bold mb-4">最近の取引例（最大10件）</h3>
                  <ul className="space-y-2">
                    {realEstate.transactions.slice(0, 10).map((tx, idx) => (
                      <li key={tx.id || idx} className="p-3 border rounded text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{tx.propertyType}</span>
                          <span className="font-bold text-blue-600">{(tx.tradePrice / 10000).toFixed(0)}万円</span>
                        </div>
                        <div className="text-gray-600">
                          {tx.floorPlan && <span>{tx.floorPlan} / </span>}
                          {tx.area}㎡
                          {tx.buildingYear && <span> / {tx.buildingYear}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">不動産相場</h2>
                <p className="text-gray-600">この地区の不動産取引データはありません</p>
              </section>
            )}
          </div>
        </div>

        <footer className="mt-8 text-sm text-gray-500 space-y-2">
          <p>※ スコアは施設の数と距離を基に自動計算しています。医療サービスの質を保証するものではありません。</p>
          <nav className="space-x-4" aria-label="法的情報">
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
