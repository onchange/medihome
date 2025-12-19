import { PrismaClient, MedicalFacility, Department } from '@prisma/client'

const prisma = new PrismaClient()

type FacilityWithDepartments = MedicalFacility & { departments: Department[] }

interface ScoreDetails {
  pediatricsCount?: number
  hasNightPediatrics?: boolean
  maternityCount?: number
  hasNearbyHospital?: boolean
  pharmacyCount?: number
  cardiologyCount?: number
  orthopedicsCount?: number
  rehabCount?: number
  homeVisitCount?: number
  internalMedicineCount?: number
  departmentVariety?: number
  dentalCount?: number
}

interface DistrictCenter {
  lat: number
  lng: number
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateDistrictCenter(facilities: FacilityWithDepartments[]): DistrictCenter {
  if (facilities.length === 0) {
    return { lat: 0, lng: 0 }
  }
  return {
    lat: facilities.reduce((sum, f) => sum + f.latitude, 0) / facilities.length,
    lng: facilities.reduce((sum, f) => sum + f.longitude, 0) / facilities.length,
  }
}

function hasNearbyHospital(
  districtCenter: DistrictCenter,
  hospitals: MedicalFacility[],
  maxDistanceKm: number = 1
): boolean {
  if (districtCenter.lat === 0) return false
  return hospitals.some((hospital) => {
    const distance = calculateDistance(
      districtCenter.lat,
      districtCenter.lng,
      hospital.latitude,
      hospital.longitude
    )
    return distance <= maxDistanceKm
  })
}

function calculateChildcareScore(
  districtFacilities: FacilityWithDepartments[],
  districtCenter: DistrictCenter,
  allHospitals: MedicalFacility[]
): { score: number; details: ScoreDetails } {
  let score = 0
  const details: ScoreDetails = {}

  const pediatricsDepartments = districtFacilities.flatMap((f) =>
    f.departments.filter((d) => d.departmentName.includes('小児科'))
  )
  const pediatricsCount = new Set(pediatricsDepartments.map((d) => d.facilityId)).size

  score += Math.min(pediatricsCount * 10, 30)
  details.pediatricsCount = pediatricsCount

  const nightPediatrics = pediatricsDepartments.filter(
    (d) => d.departmentName.includes('小児科') && d.hasNightService
  )
  score += nightPediatrics.length > 0 ? 20 : 0
  details.hasNightPediatrics = nightPediatrics.length > 0

  const maternityFacilities = districtFacilities.filter(
    (f) =>
      f.facilityType === '助産所' ||
      f.departments.some((d) => d.departmentName.includes('産婦人科'))
  )
  score += maternityFacilities.length > 0 ? 20 : 0
  details.maternityCount = maternityFacilities.length

  const nearbyHospitalFound = hasNearbyHospital(districtCenter, allHospitals)
  score += nearbyHospitalFound ? 15 : 0
  details.hasNearbyHospital = nearbyHospitalFound

  const pharmacies = districtFacilities.filter((f) => f.facilityType === '薬局')
  score += pharmacies.length >= 3 ? 15 : 0
  details.pharmacyCount = pharmacies.length

  return { score: Math.min(score, 100), details }
}

function calculateElderlyScore(
  districtFacilities: FacilityWithDepartments[],
  districtCenter: DistrictCenter,
  allHospitals: MedicalFacility[]
): { score: number; details: ScoreDetails } {
  let score = 0
  const details: ScoreDetails = {}

  const cardiologyDepts = districtFacilities.flatMap((f) =>
    f.departments.filter((d) => d.departmentName.includes('循環器'))
  )
  score += cardiologyDepts.length > 0 ? 20 : 0
  details.cardiologyCount = new Set(cardiologyDepts.map((d) => d.facilityId)).size

  const orthopedicsDepts = districtFacilities.flatMap((f) =>
    f.departments.filter((d) => d.departmentName.includes('整形外科'))
  )
  score += orthopedicsDepts.length > 0 ? 20 : 0
  details.orthopedicsCount = new Set(orthopedicsDepts.map((d) => d.facilityId)).size

  const rehabDepts = districtFacilities.flatMap((f) =>
    f.departments.filter((d) => d.departmentName.includes('リハビリ'))
  )
  score += rehabDepts.length > 0 ? 20 : 0
  details.rehabCount = new Set(rehabDepts.map((d) => d.facilityId)).size

  const homeVisitDepts = districtFacilities.flatMap((f) =>
    f.departments.filter((d) => d.hasHomeVisit)
  )
  score += homeVisitDepts.length > 0 ? 25 : 0
  details.homeVisitCount = new Set(homeVisitDepts.map((d) => d.facilityId)).size

  const nearbyHospitalFound = hasNearbyHospital(districtCenter, allHospitals)
  score += nearbyHospitalFound ? 15 : 0
  details.hasNearbyHospital = nearbyHospitalFound

  return { score: Math.min(score, 100), details }
}

function calculateGeneralScore(
  districtFacilities: FacilityWithDepartments[],
  districtCenter: DistrictCenter,
  allHospitals: MedicalFacility[]
): { score: number; details: ScoreDetails } {
  let score = 0
  const details: ScoreDetails = {}

  const internalMedicineDepts = districtFacilities.flatMap((f) =>
    f.departments.filter((d) => d.departmentName.includes('内科'))
  )
  const internalMedicineCount = new Set(internalMedicineDepts.map((d) => d.facilityId)).size

  if (internalMedicineCount === 0) {
    score += 0
  } else if (internalMedicineCount >= 3) {
    score += 30
  } else {
    score += 15
  }
  details.internalMedicineCount = internalMedicineCount

  const allDepartmentNames = new Set(
    districtFacilities.flatMap((f) => f.departments.map((d) => d.departmentName))
  )
  const departmentVariety = allDepartmentNames.size

  score += departmentVariety >= 5 ? 25 : departmentVariety * 5
  details.departmentVariety = departmentVariety

  const dentalFacilities = districtFacilities.filter((f) => f.facilityType === '歯科')
  score += dentalFacilities.length > 0 ? 15 : 0
  details.dentalCount = dentalFacilities.length

  const nearbyHospitalFound = hasNearbyHospital(districtCenter, allHospitals)
  score += nearbyHospitalFound ? 15 : 0
  details.hasNearbyHospital = nearbyHospitalFound

  const pharmacies = districtFacilities.filter((f) => f.facilityType === '薬局')
  score += pharmacies.length >= 3 ? 15 : 0
  details.pharmacyCount = pharmacies.length

  return { score: Math.min(score, 100), details }
}

async function calculateDistrictScores() {
  console.log('📊 地区別医療アクセススコアの計算開始\n')

  const allFacilities = await prisma.medicalFacility.findMany({
    include: { departments: true },
  })

  const allHospitals = allFacilities.filter((f) => f.facilityType === '病院')
  console.log(`📌 全施設: ${allFacilities.length}件, 病院: ${allHospitals.length}件\n`)

  const facilitiesByDistrict = new Map<string, FacilityWithDepartments[]>()
  for (const facility of allFacilities) {
    const existing = facilitiesByDistrict.get(facility.districtName) || []
    existing.push(facility)
    facilitiesByDistrict.set(facility.districtName, existing)
  }

  const uniqueDistricts = Array.from(facilitiesByDistrict.keys())
  console.log(`対象地区: ${uniqueDistricts.length}地区\n`)

  await prisma.districtMedicalScore.deleteMany({})

  for (const district of uniqueDistricts) {
    const districtFacilities = facilitiesByDistrict.get(district) || []

    const hospitalCount = districtFacilities.filter((f) => f.facilityType === '病院').length
    const clinicCount = districtFacilities.filter((f) => f.facilityType === '診療所').length
    const dentalCount = districtFacilities.filter((f) => f.facilityType === '歯科').length
    const pharmacyCount = districtFacilities.filter((f) => f.facilityType === '薬局').length

    const districtCenter = calculateDistrictCenter(districtFacilities)

    const { score: childcareScore, details: childcareDetails } = calculateChildcareScore(
      districtFacilities,
      districtCenter,
      allHospitals
    )
    const { score: elderlyScore, details: elderlyDetails } = calculateElderlyScore(
      districtFacilities,
      districtCenter,
      allHospitals
    )
    const { score: generalScore, details: generalDetails } = calculateGeneralScore(
      districtFacilities,
      districtCenter,
      allHospitals
    )

    const overallScore = Math.round((childcareScore + elderlyScore + generalScore) / 3)

    const scoreDetails = JSON.stringify({
      childcare: childcareDetails,
      elderly: elderlyDetails,
      general: generalDetails,
    })

    await prisma.districtMedicalScore.create({
      data: {
        districtName: district,
        childcareScore,
        elderlyScore,
        generalScore,
        overallScore,
        scoreDetails,
        hospitalCount,
        clinicCount,
        dentalCount,
        pharmacyCount,
      },
    })

    console.log(
      `✅ ${district}: 総合${overallScore}点 (子育て${childcareScore}点, 高齢者${elderlyScore}点, 一般${generalScore}点)`
    )
  }

  console.log('\n✅ スコア計算完了')

  await prisma.$disconnect()
}

calculateDistrictScores().catch((error) => {
  console.error('❌ エラーが発生しました:', error)
  process.exit(1)
})
