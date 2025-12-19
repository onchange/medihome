import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { District } from '@/types'
import DistrictFilter from '@/components/DistrictFilter'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">MediHome - 医療アクセス × 不動産相場</h1>
        <p className="text-gray-600 mb-8">浦安市の医療施設と不動産相場を地区別に比較できます</p>

        <DistrictFilter districts={districts} />

        <footer className="text-sm text-gray-500 space-y-2">
          <p>データ出典: 厚生労働省医療情報ネット、国土交通省不動産情報ライブラリ</p>
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
