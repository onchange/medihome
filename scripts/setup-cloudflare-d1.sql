-- Cloudflare D1用のスキーマセットアップ
-- このファイルをCloudflare D1にインポートして使用します

CREATE TABLE IF NOT EXISTS MedicalFacility (
  id TEXT PRIMARY KEY NOT NULL,
  facilityType TEXT NOT NULL,
  name TEXT NOT NULL,
  postalCode TEXT NOT NULL,
  address TEXT NOT NULL,
  districtName TEXT NOT NULL,
  phoneNumber TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_medicalfacility_districtname ON MedicalFacility(districtName);
CREATE INDEX IF NOT EXISTS idx_medicalfacility_facilitytype ON MedicalFacility(facilityType);

CREATE TABLE IF NOT EXISTS Department (
  id TEXT PRIMARY KEY NOT NULL,
  facilityId TEXT NOT NULL,
  departmentName TEXT NOT NULL,
  consultationHours TEXT,
  hasNightService INTEGER NOT NULL DEFAULT 0,
  hasWeekendService INTEGER NOT NULL DEFAULT 0,
  hasHomeVisit INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (facilityId) REFERENCES MedicalFacility(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_department_departmentname ON Department(departmentName);
CREATE INDEX IF NOT EXISTS idx_department_facilityid ON Department(facilityId);

CREATE TABLE IF NOT EXISTS RealEstateTransaction (
  id TEXT PRIMARY KEY NOT NULL,
  districtName TEXT NOT NULL,
  districtCode TEXT NOT NULL,
  tradePrice INTEGER NOT NULL,
  propertyType TEXT NOT NULL,
  floorPlan TEXT,
  area REAL NOT NULL,
  buildingYear TEXT,
  structure TEXT,
  year TEXT NOT NULL,
  quarter TEXT NOT NULL,
  period TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_realestate_districtname ON RealEstateTransaction(districtName);
CREATE INDEX IF NOT EXISTS idx_realestate_propertytype ON RealEstateTransaction(propertyType);
CREATE INDEX IF NOT EXISTS idx_realestate_year_quarter ON RealEstateTransaction(year, quarter);
CREATE INDEX IF NOT EXISTS idx_realestate_district_property ON RealEstateTransaction(districtName, propertyType);

CREATE TABLE IF NOT EXISTS DistrictMedicalScore (
  id TEXT PRIMARY KEY NOT NULL,
  districtName TEXT NOT NULL UNIQUE,
  childcareScore INTEGER NOT NULL,
  elderlyScore INTEGER NOT NULL,
  generalScore INTEGER NOT NULL,
  overallScore INTEGER NOT NULL,
  scoreDetails TEXT NOT NULL,
  hospitalCount INTEGER NOT NULL,
  clinicCount INTEGER NOT NULL,
  dentalCount INTEGER NOT NULL,
  pharmacyCount INTEGER NOT NULL,
  calculatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_districtscore_overallscore ON DistrictMedicalScore(overallScore);
