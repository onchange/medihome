export interface District {
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
}

export interface DistrictScore {
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
}

export interface ScoreDetails {
  childcare: ChildcareScoreDetails
  elderly: ElderlyScoreDetails
  general: GeneralScoreDetails
}

export interface ChildcareScoreDetails {
  pediatricsCount: number
  hasNightPediatrics: boolean
  maternityCount: number
  pharmacyCount: number
  hasNearbyHospital: boolean
}

export interface ElderlyScoreDetails {
  cardiologyCount: number
  orthopedicsCount: number
  rehabCount: number
  homeVisitCount: number
  hasNearbyHospital: boolean
}

export interface GeneralScoreDetails {
  internalMedicineCount: number
  departmentVariety: number
  dentalCount: number
  pharmacyCount: number
  hasNearbyHospital: boolean
}

export interface ScoreResponse {
  score: DistrictScore
  details: ScoreDetails | null
}

export interface ApiError {
  error: string
  details?: string
}

export const VALID_DISTRICTS = [
  '千代田区',
  '中央区',
  '港区',
  '新宿区',
  '文京区',
  '台東区',
  '墨田区',
  '江東区',
  '品川区',
  '目黒区',
  '大田区',
  '世田谷区',
  '渋谷区',
  '中野区',
  '杉並区',
  '豊島区',
  '北区',
  '荒川区',
  '板橋区',
  '練馬区',
  '足立区',
  '葛飾区',
  '江戸川区',
] as const

export type ValidDistrict = typeof VALID_DISTRICTS[number]

export function isValidDistrict(district: string): district is ValidDistrict {
  return VALID_DISTRICTS.includes(district as ValidDistrict)
}

export function sanitizeDistrict(district: string): string {
  return district.replace(/[<>"'&]/g, '')
}

export interface MedicalFacility {
  id: string
  name: string
  facilityType: string
  latitude: number
  longitude: number
  districtName: string
  address: string | null
  phone: string | null
  website: string | null
  departments?: string[]
}
