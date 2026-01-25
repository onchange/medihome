import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getScoreColor } from '@/lib/score-utils'
import { sanitizeDistrict, isValidDistrict } from '@/types'
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
}

async function getDistrictData(districtName: string): Promise<DistrictData> {
  try {
    const [score, facilities] = await Promise.all([
      prisma.districtMedicalScore.findUnique({
        where: { districtName },
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

    return { score, details, facilities }
  } catch (error) {
    console.error('Error fetching district data:', error)
    return { score: null, details: null, facilities: [] }
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
      return '病院'
    case '診療所':
      return '診療所'
    case '歯科':
      return '歯科'
    case '薬局':
      return '薬局'
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

  const { score, details, facilities } = await getDistrictData(district)

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
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/" className="text-blue-100 hover:text-white mb-2 inline-block">
            ← トップページに戻る
          </Link>
          <h1 className="text-3xl font-bold">{district}エリア</h1>
          <p className="text-blue-100">医療アクセス詳細</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
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
                    className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}
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
                <div className="p-3 border rounded bg-red-50 border-red-200">
                  <div className="text-sm text-gray-600">病院</div>
                  <div className="text-2xl font-bold">{score.hospitalCount}件</div>
                </div>
                <div className="p-3 border rounded bg-blue-50 border-blue-200">
                  <div className="text-sm text-gray-600">診療所</div>
                  <div className="text-2xl font-bold">{score.clinicCount}件</div>
                </div>
                <div className="p-3 border rounded bg-green-50 border-green-200">
                  <div className="text-sm text-gray-600">歯科</div>
                  <div className="text-2xl font-bold">{score.dentalCount}件</div>
                </div>
                <div className="p-3 border rounded bg-yellow-50 border-yellow-200">
                  <div className="text-sm text-gray-600">薬局</div>
                  <div className="text-2xl font-bold">{score.pharmacyCount}件</div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {facilities.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6" aria-labelledby="facilities-list-heading">
                <h3 id="facilities-list-heading" className="text-xl font-bold mb-4">医療施設一覧</h3>
                <p className="text-sm text-gray-600 mb-4">
                  施設名をクリックするとGoogle Mapsで場所を確認できます
                </p>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
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
                        <span className="text-xs whitespace-nowrap bg-white px-2 py-1 rounded border">
                          {getFacilityTypeLabel(facility.facilityType)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className="mt-8 text-sm text-gray-500 space-y-2 border-t pt-8">
          <p>スコアは面積あたりの施設密度を基に自動計算しています。医療サービスの質を保証するものではありません。</p>
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
