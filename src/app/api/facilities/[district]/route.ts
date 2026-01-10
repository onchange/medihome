import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidDistrict, sanitizeDistrict } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ district: string }> }
) {
  try {
    const resolvedParams = await params
    const districtRaw = resolvedParams.district

    if (!districtRaw || typeof districtRaw !== 'string') {
      return NextResponse.json({ error: '地区名が指定されていません' }, { status: 400 })
    }

    const district = sanitizeDistrict(districtRaw)

    if (!isValidDistrict(district)) {
      return NextResponse.json({ error: '無効な地区名です' }, { status: 400 })
    }

    const facilities = await prisma.medicalFacility.findMany({
      where: {
        districtName: district,
      },
      select: {
        id: true,
        name: true,
        facilityType: true,
        latitude: true,
        longitude: true,
        districtName: true,
        address: true,
        phoneNumber: true,
        departments: {
          select: {
            departmentName: true,
          },
        },
      },
      orderBy: [{ facilityType: 'asc' }, { name: 'asc' }],
    })

    const formattedFacilities = facilities.map((facility) => ({
      id: facility.id,
      name: facility.name,
      facilityType: facility.facilityType,
      latitude: facility.latitude,
      longitude: facility.longitude,
      districtName: facility.districtName,
      address: facility.address,
      phone: facility.phoneNumber,
      website: null,
      departments: facility.departments.map((d) => d.departmentName),
    }))

    return NextResponse.json(formattedFacilities)
  } catch (error) {
    console.error('医療施設データ取得エラー:', error)
    return NextResponse.json(
      { error: 'データ取得中にエラーが発生しました', details: String(error) },
      { status: 500 }
    )
  }
}
