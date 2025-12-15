import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function calculateChildcareScore(districtName: string): Promise<{ score: number, details: any }> {
  let score = 0
  const details: any = {}

  const districtFacilities = await prisma.medicalFacility.findMany({
    where: { districtName },
    include: { departments: true },
  })

  const allFacilities = await prisma.medicalFacility.findMany({
    where: { facilityType: '病院' },
  })

  const pediatricsDepartments = districtFacilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('小児科'))
  )
  const pediatricsCount = new Set(pediatricsDepartments.map(d => d.facilityId)).size

  score += Math.min(pediatricsCount * 10, 30)
  details.pediatricsCount = pediatricsCount

  const nightPediatrics = pediatricsDepartments.filter(d =>
    d.departmentName.includes('小児科') && d.hasNightService
  )
  score += nightPediatrics.length > 0 ? 20 : 0
  details.hasNightPediatrics = nightPediatrics.length > 0

  const maternityFacilities = districtFacilities.filter(f =>
    f.facilityType === '助産所' ||
    f.departments.some(d => d.departmentName.includes('産婦人科'))
  )
  score += maternityFacilities.length > 0 ? 20 : 0
  details.maternityCount = maternityFacilities.length

  const districtCenter = {
    lat: districtFacilities.length > 0
      ? districtFacilities.reduce((sum, f) => sum + f.latitude, 0) / districtFacilities.length
      : 0,
    lng: districtFacilities.length > 0
      ? districtFacilities.reduce((sum, f) => sum + f.longitude, 0) / districtFacilities.length
      : 0
  }

  const nearbyHospital = allFacilities.some(hospital => {
    if (districtCenter.lat === 0) return false
    const distance = calculateDistance(
      districtCenter.lat,
      districtCenter.lng,
      hospital.latitude,
      hospital.longitude
    )
    return distance <= 1
  })

  score += nearbyHospital ? 15 : 0
  details.hasNearbyHospital = nearbyHospital

  const pharmacies = districtFacilities.filter(f => f.facilityType === '薬局')
  score += pharmacies.length >= 3 ? 15 : 0
  details.pharmacyCount = pharmacies.length

  return { score: Math.min(score, 100), details }
}

async function calculateElderlyScore(districtName: string): Promise<{ score: number, details: any }> {
  let score = 0
  const details: any = {}

  const districtFacilities = await prisma.medicalFacility.findMany({
    where: { districtName },
    include: { departments: true },
  })

  const allFacilities = await prisma.medicalFacility.findMany({
    where: { facilityType: '病院' },
  })

  const cardiologyDepts = districtFacilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('循環器'))
  )
  score += cardiologyDepts.length > 0 ? 20 : 0
  details.cardiologyCount = new Set(cardiologyDepts.map(d => d.facilityId)).size

  const orthopedicsDepts = districtFacilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('整形外科'))
  )
  score += orthopedicsDepts.length > 0 ? 20 : 0
  details.orthopedicsCount = new Set(orthopedicsDepts.map(d => d.facilityId)).size

  const rehabDepts = districtFacilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('リハビリ'))
  )
  score += rehabDepts.length > 0 ? 20 : 0
  details.rehabCount = new Set(rehabDepts.map(d => d.facilityId)).size

  const homeVisitDepts = districtFacilities.flatMap(f =>
    f.departments.filter(d => d.hasHomeVisit)
  )
  score += homeVisitDepts.length > 0 ? 25 : 0
  details.homeVisitCount = new Set(homeVisitDepts.map(d => d.facilityId)).size

  const districtCenter = {
    lat: districtFacilities.length > 0
      ? districtFacilities.reduce((sum, f) => sum + f.latitude, 0) / districtFacilities.length
      : 0,
    lng: districtFacilities.length > 0
      ? districtFacilities.reduce((sum, f) => sum + f.longitude, 0) / districtFacilities.length
      : 0
  }

  const nearbyHospital = allFacilities.some(hospital => {
    if (districtCenter.lat === 0) return false
    const distance = calculateDistance(
      districtCenter.lat,
      districtCenter.lng,
      hospital.latitude,
      hospital.longitude
    )
    return distance <= 1
  })

  score += nearbyHospital ? 15 : 0
  details.hasNearbyHospital = nearbyHospital

  return { score: Math.min(score, 100), details }
}

async function calculateGeneralScore(districtName: string): Promise<{ score: number, details: any }> {
  let score = 0
  const details: any = {}

  const districtFacilities = await prisma.medicalFacility.findMany({
    where: { districtName },
    include: { departments: true },
  })

  const allFacilities = await prisma.medicalFacility.findMany({
    where: { facilityType: '病院' },
  })

  const internalMedicineDepts = districtFacilities.flatMap(f =>
    f.departments.filter(d => d.departmentName.includes('内科'))
  )
  const internalMedicineCount = new Set(internalMedicineDepts.map(d => d.facilityId)).size

  if (internalMedicineCount === 0) {
    score += 0
  } else if (internalMedicineCount >= 3) {
    score += 30
  } else {
    score += 15
  }
  details.internalMedicineCount = internalMedicineCount

  const allDepartmentNames = new Set(
    districtFacilities.flatMap(f => f.departments.map(d => d.departmentName))
  )
  const departmentVariety = allDepartmentNames.size

  score += departmentVariety >= 5 ? 25 : departmentVariety * 5
  details.departmentVariety = departmentVariety

  const dentalFacilities = districtFacilities.filter(f => f.facilityType === '歯科')
  score += dentalFacilities.length > 0 ? 15 : 0
  details.dentalCount = dentalFacilities.length

  const districtCenter = {
    lat: districtFacilities.length > 0
      ? districtFacilities.reduce((sum, f) => sum + f.latitude, 0) / districtFacilities.length
      : 0,
    lng: districtFacilities.length > 0
      ? districtFacilities.reduce((sum, f) => sum + f.longitude, 0) / districtFacilities.length
      : 0
  }

  const nearbyHospital = allFacilities.some(hospital => {
    if (districtCenter.lat === 0) return false
    const distance = calculateDistance(
      districtCenter.lat,
      districtCenter.lng,
      hospital.latitude,
      hospital.longitude
    )
    return distance <= 1
  })

  score += nearbyHospital ? 15 : 0
  details.hasNearbyHospital = nearbyHospital

  const pharmacies = districtFacilities.filter(f => f.facilityType === '薬局')
  score += pharmacies.length >= 3 ? 15 : 0
  details.pharmacyCount = pharmacies.length

  return { score: Math.min(score, 100), details }
}

async function calculateDistrictScores() {
  console.log('📊 地区別医療アクセススコアの計算開始\n')

  const allDistricts = await prisma.medicalFacility.findMany({
    select: { districtName: true },
    distinct: ['districtName'],
  })

  const uniqueDistricts = allDistricts.map(d => d.districtName)
  console.log(`対象地区: ${uniqueDistricts.length}地区\n`)

  for (const district of uniqueDistricts) {
    const districtFacilities = await prisma.medicalFacility.findMany({
      where: { districtName: district },
    })

    const hospitalCount = districtFacilities.filter(f => f.facilityType === '病院').length
    const clinicCount = districtFacilities.filter(f => f.facilityType === '診療所').length
    const dentalCount = districtFacilities.filter(f => f.facilityType === '歯科').length
    const pharmacyCount = districtFacilities.filter(f => f.facilityType === '薬局').length

    const { score: childcareScore, details: childcareDetails } = await calculateChildcareScore(district)
    const { score: elderlyScore, details: elderlyDetails } = await calculateElderlyScore(district)
    const { score: generalScore, details: generalDetails } = await calculateGeneralScore(district)

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

    console.log(`✅ ${district}: 総合${overallScore}点 (子育て${childcareScore}点, 高齢者${elderlyScore}点, 一般${generalScore}点)`)
  }

  console.log('\n✅ スコア計算完了')

  await prisma.$disconnect()
}

calculateDistrictScores()
  .catch(error => {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  })
