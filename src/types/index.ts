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
  hasNearbyHospital: boolean
}

export interface ElderlyScoreDetails {
  cardiologyCount: number
  orthopedicsCount: number
  rehabilitationCount: number
  hasNearbyHospital: boolean
}

export interface GeneralScoreDetails {
  internalMedicineCount: number
  departmentDiversity: number
  dentalCount: number
  pharmacyCount: number
}

export interface RealEstateTransaction {
  id: string
  districtName: string
  districtCode: string
  tradePrice: number
  propertyType: string
  floorPlan: string | null
  area: number
  buildingYear: string | null
  structure: string | null
  year: string
  quarter: string
  period: string
}

export interface RealEstateData {
  count: number
  avgPrice: number
  medianPrice: number
  transactions: RealEstateTransaction[]
  totalCount?: number
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
  '猫実',
  '北栄',
  '当代島',
  '堀江',
  '富士見',
  '東野',
  '弁天',
  '海楽',
  '入船',
  '美浜',
  '今川',
  '富岡',
  '東西',
  '日の出',
  '明海',
  '高洲',
  '鉄鋼通り',
  '港',
  '千鳥',
  '舞浜',
  '浦安駅前',
] as const

export type ValidDistrict = typeof VALID_DISTRICTS[number]

export function isValidDistrict(district: string): district is ValidDistrict {
  return VALID_DISTRICTS.includes(district as ValidDistrict)
}

export function sanitizeDistrict(district: string): string {
  return district.replace(/[<>"'&]/g, '')
}
