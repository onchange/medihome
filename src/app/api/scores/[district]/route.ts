import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidDistrict, sanitizeDistrict } from '@/types'

export async function GET(
  request: Request,
  context: { params: Promise<{ district: string }> }
) {
  try {
    const { district } = await context.params
    const districtName = sanitizeDistrict(decodeURIComponent(district))

    if (!isValidDistrict(districtName)) {
      return NextResponse.json(
        { error: '無効な地区名です' },
        { status: 400 }
      )
    }

    const score = await prisma.districtMedicalScore.findUnique({
      where: { districtName },
    })

    if (!score) {
      return NextResponse.json(
        { error: '地区が見つかりません' },
        { status: 404 }
      )
    }

    const facilities = await prisma.medicalFacility.findMany({
      where: { districtName },
      include: { departments: true },
    })

    let details = null
    try {
      details = JSON.parse(score.scoreDetails)
    } catch {
      console.warn('Failed to parse scoreDetails for district:', districtName)
    }

    return NextResponse.json({
      score,
      details,
      facilities,
      facilityCount: facilities.length,
    })
  } catch (error) {
    console.error('Error fetching district scores:', error)
    const message = process.env.NODE_ENV === 'production'
      ? '地区スコアの取得に失敗しました'
      : error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
