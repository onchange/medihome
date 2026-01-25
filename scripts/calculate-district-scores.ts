import { PrismaClient, MedicalFacility, Department } from '@prisma/client'

const prisma = new PrismaClient()

type FacilityWithDepartments = MedicalFacility & { departments: Department[] }

interface ScoreDetails {
  pediatricsCount?: number
  pediatricsRank?: number
  hasNightPediatrics?: boolean
  maternityCount?: number
  hasNearbyHospital?: boolean
  pharmacyCount?: number
  pharmacyDensity?: number
  cardiologyCount?: number
  orthopedicsCount?: number
  rehabCount?: number
  homeVisitCount?: number
  internalMedicineCount?: number
  internalMedicineDensity?: number
  departmentVariety?: number
  dentalCount?: number
  dentalDensity?: number
  hospitalCount?: number
  clinicDensity?: number
}

interface DistrictStats {
  districtName: string
  facilities: FacilityWithDepartments[]
  hospitalCount: number
  clinicCount: number
  dentalCount: number
  pharmacyCount: number
  pediatricsCount: number
  hasNightPediatrics: boolean
  maternityCount: number
  cardiologyCount: number
  orthopedicsCount: number
  rehabCount: number
  homeVisitCount: number
  internalMedicineCount: number
  departmentVariety: number
  totalFacilities: number
}

const TOKYO_23_WARD_AREA: Record<string, number> = {
  '千代田区': 11.66,
  '中央区': 10.21,
  '港区': 20.37,
  '新宿区': 18.22,
  '文京区': 11.29,
  '台東区': 10.11,
  '墨田区': 13.77,
  '江東区': 40.16,
  '品川区': 22.84,
  '目黒区': 14.67,
  '大田区': 60.83,
  '世田谷区': 58.05,
  '渋谷区': 15.11,
  '中野区': 15.59,
  '杉並区': 34.06,
  '豊島区': 13.01,
  '北区': 20.61,
  '荒川区': 10.16,
  '板橋区': 32.22,
  '練馬区': 48.08,
  '足立区': 53.25,
  '葛飾区': 34.80,
  '江戸川区': 49.90,
}

function calculatePercentileScore(value: number, allValues: number[]): number {
  const sorted = [...allValues].sort((a, b) => a - b)
  const rank = sorted.findIndex(v => v >= value)
  const percentile = (rank / (sorted.length - 1)) * 100
  return Math.round(percentile)
}

function collectDistrictStats(
  districtName: string,
  facilities: FacilityWithDepartments[]
): DistrictStats {
  const hospitalCount = facilities.filter(f => f.facilityType === '病院').length
  const clinicCount = facilities.filter(f => f.facilityType === '診療所').length
  const dentalCount = facilities.filter(f => f.facilityType === '歯科').length
  const pharmacyCount = facilities.filter(f => f.facilityType === '薬局').length

  const pediatricsDepts = facilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('小児科'))
  )
  const pediatricsCount = new Set(pediatricsDepts.map(d => d.facilityId)).size
  const hasNightPediatrics = pediatricsDepts.some(d => d.hasNightService)

  const maternityFacilities = facilities.filter(f =>
    f.facilityType === '助産所' ||
    f.departments.some(d => d.departmentName.includes('産婦人科') || d.departmentName.includes('産科'))
  )
  const maternityCount = maternityFacilities.length

  const cardiologyDepts = facilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('循環器'))
  )
  const cardiologyCount = new Set(cardiologyDepts.map(d => d.facilityId)).size

  const orthopedicsDepts = facilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('整形外科'))
  )
  const orthopedicsCount = new Set(orthopedicsDepts.map(d => d.facilityId)).size

  const rehabDepts = facilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('リハビリ'))
  )
  const rehabCount = new Set(rehabDepts.map(d => d.facilityId)).size

  const homeVisitDepts = facilities.flatMap(f =>
    f.departments.filter(d => d.hasHomeVisit)
  )
  const homeVisitCount = new Set(homeVisitDepts.map(d => d.facilityId)).size

  const internalMedicineDepts = facilities.flatMap(f =>
    f.departments.filter(d =>
      d.departmentName.includes('内科') && !d.departmentName.includes('歯科')
    )
  )
  const internalMedicineCount = new Set(internalMedicineDepts.map(d => d.facilityId)).size

  const allDepartmentNames = new Set(
    facilities.flatMap(f => f.departments.map(d => d.departmentName))
  )
  const departmentVariety = allDepartmentNames.size

  return {
    districtName,
    facilities,
    hospitalCount,
    clinicCount,
    dentalCount,
    pharmacyCount,
    pediatricsCount,
    hasNightPediatrics,
    maternityCount,
    cardiologyCount,
    orthopedicsCount,
    rehabCount,
    homeVisitCount,
    internalMedicineCount,
    departmentVariety,
    totalFacilities: hospitalCount + clinicCount + dentalCount + pharmacyCount,
  }
}

function calculateChildcareScore(
  stats: DistrictStats,
  allStats: DistrictStats[]
): { score: number; details: ScoreDetails } {
  const area = TOKYO_23_WARD_AREA[stats.districtName] || 20

  const pediatricsDensity = stats.pediatricsCount / area
  const allPediatricsDensities = allStats.map(s => s.pediatricsCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const pediatricsScore = calculatePercentileScore(pediatricsDensity, allPediatricsDensities)

  const nightScore = stats.hasNightPediatrics ? 100 : 0

  const maternityDensity = stats.maternityCount / area
  const allMaternityDensities = allStats.map(s => s.maternityCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const maternityScore = calculatePercentileScore(maternityDensity, allMaternityDensities)

  const pharmacyDensity = stats.pharmacyCount / area
  const allPharmacyDensities = allStats.map(s => s.pharmacyCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const pharmacyScore = calculatePercentileScore(pharmacyDensity, allPharmacyDensities)

  const hospitalScore = stats.hospitalCount >= 2 ? 100 : stats.hospitalCount === 1 ? 50 : 0

  const score = Math.round(
    pediatricsScore * 0.35 +
    nightScore * 0.15 +
    maternityScore * 0.20 +
    pharmacyScore * 0.15 +
    hospitalScore * 0.15
  )

  return {
    score,
    details: {
      pediatricsCount: stats.pediatricsCount,
      hasNightPediatrics: stats.hasNightPediatrics,
      maternityCount: stats.maternityCount,
      pharmacyCount: stats.pharmacyCount,
      hasNearbyHospital: stats.hospitalCount > 0,
    },
  }
}

function calculateElderlyScore(
  stats: DistrictStats,
  allStats: DistrictStats[]
): { score: number; details: ScoreDetails } {
  const area = TOKYO_23_WARD_AREA[stats.districtName] || 20

  const cardiologyDensity = stats.cardiologyCount / area
  const allCardiologyDensities = allStats.map(s => s.cardiologyCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const cardiologyScore = calculatePercentileScore(cardiologyDensity, allCardiologyDensities)

  const orthopedicsDensity = stats.orthopedicsCount / area
  const allOrthopedicsDensities = allStats.map(s => s.orthopedicsCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const orthopedicsScore = calculatePercentileScore(orthopedicsDensity, allOrthopedicsDensities)

  const rehabDensity = stats.rehabCount / area
  const allRehabDensities = allStats.map(s => s.rehabCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const rehabScore = calculatePercentileScore(rehabDensity, allRehabDensities)

  const hospitalDensity = stats.hospitalCount / area
  const allHospitalDensities = allStats.map(s => s.hospitalCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const hospitalScore = calculatePercentileScore(hospitalDensity, allHospitalDensities)

  const score = Math.round(
    cardiologyScore * 0.25 +
    orthopedicsScore * 0.25 +
    rehabScore * 0.25 +
    hospitalScore * 0.25
  )

  return {
    score,
    details: {
      cardiologyCount: stats.cardiologyCount,
      orthopedicsCount: stats.orthopedicsCount,
      rehabCount: stats.rehabCount,
      homeVisitCount: stats.homeVisitCount,
      hasNearbyHospital: stats.hospitalCount > 0,
    },
  }
}

function calculateGeneralScore(
  stats: DistrictStats,
  allStats: DistrictStats[]
): { score: number; details: ScoreDetails } {
  const area = TOKYO_23_WARD_AREA[stats.districtName] || 20

  const internalMedicineDensity = stats.internalMedicineCount / area
  const allInternalMedicineDensities = allStats.map(s => s.internalMedicineCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const internalMedicineScore = calculatePercentileScore(internalMedicineDensity, allInternalMedicineDensities)

  const dentalDensity = stats.dentalCount / area
  const allDentalDensities = allStats.map(s => s.dentalCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const dentalScore = calculatePercentileScore(dentalDensity, allDentalDensities)

  const pharmacyDensity = stats.pharmacyCount / area
  const allPharmacyDensities = allStats.map(s => s.pharmacyCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const pharmacyScore = calculatePercentileScore(pharmacyDensity, allPharmacyDensities)

  const clinicDensity = stats.clinicCount / area
  const allClinicDensities = allStats.map(s => s.clinicCount / (TOKYO_23_WARD_AREA[s.districtName] || 20))
  const clinicScore = calculatePercentileScore(clinicDensity, allClinicDensities)

  const varietyScore = calculatePercentileScore(
    stats.departmentVariety,
    allStats.map(s => s.departmentVariety)
  )

  const score = Math.round(
    internalMedicineScore * 0.25 +
    dentalScore * 0.20 +
    pharmacyScore * 0.20 +
    clinicScore * 0.20 +
    varietyScore * 0.15
  )

  return {
    score,
    details: {
      internalMedicineCount: stats.internalMedicineCount,
      departmentVariety: stats.departmentVariety,
      dentalCount: stats.dentalCount,
      pharmacyCount: stats.pharmacyCount,
      hasNearbyHospital: stats.hospitalCount > 0,
    },
  }
}

async function calculateDistrictScores() {
  console.log('📊 地区別医療アクセススコアの計算開始\n')

  const allFacilities = await prisma.medicalFacility.findMany({
    include: { departments: true },
  })

  console.log(`📌 全施設: ${allFacilities.length}件\n`)

  const facilitiesByDistrict = new Map<string, FacilityWithDepartments[]>()
  for (const facility of allFacilities) {
    const existing = facilitiesByDistrict.get(facility.districtName) || []
    existing.push(facility)
    facilitiesByDistrict.set(facility.districtName, existing)
  }

  const allStats: DistrictStats[] = []
  for (const [districtName, facilities] of facilitiesByDistrict.entries()) {
    allStats.push(collectDistrictStats(districtName, facilities))
  }

  console.log(`対象地区: ${allStats.length}地区\n`)

  await prisma.districtMedicalScore.deleteMany({})

  const results: { name: string; overall: number; childcare: number; elderly: number; general: number }[] = []

  for (const stats of allStats) {
    const { score: childcareScore, details: childcareDetails } = calculateChildcareScore(stats, allStats)
    const { score: elderlyScore, details: elderlyDetails } = calculateElderlyScore(stats, allStats)
    const { score: generalScore, details: generalDetails } = calculateGeneralScore(stats, allStats)

    const overallScore = Math.round((childcareScore + elderlyScore + generalScore) / 3)

    const scoreDetails = JSON.stringify({
      childcare: childcareDetails,
      elderly: elderlyDetails,
      general: generalDetails,
    })

    await prisma.districtMedicalScore.create({
      data: {
        districtName: stats.districtName,
        childcareScore,
        elderlyScore,
        generalScore,
        overallScore,
        scoreDetails,
        hospitalCount: stats.hospitalCount,
        clinicCount: stats.clinicCount,
        dentalCount: stats.dentalCount,
        pharmacyCount: stats.pharmacyCount,
      },
    })

    results.push({
      name: stats.districtName,
      overall: overallScore,
      childcare: childcareScore,
      elderly: elderlyScore,
      general: generalScore,
    })
  }

  results.sort((a, b) => b.overall - a.overall)

  console.log('=== スコアランキング ===\n')
  results.forEach((r, i) => {
    console.log(
      `${String(i + 1).padStart(2)}. ${r.name.padEnd(5)} 総合${String(r.overall).padStart(2)}点 (子育て${String(r.childcare).padStart(2)}点, 高齢者${String(r.elderly).padStart(2)}点, 一般${String(r.general).padStart(2)}点)`
    )
  })

  console.log('\n✅ スコア計算完了')

  await prisma.$disconnect()
}

calculateDistrictScores().catch((error) => {
  console.error('❌ エラーが発生しました:', error)
  process.exit(1)
})
