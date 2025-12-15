import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ district: string }> }
) {
  try {
    const { district } = await context.params
    const districtName = decodeURIComponent(district)

    const score = await prisma.districtMedicalScore.findUnique({
      where: { districtName }
    })

    if (!score) {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      )
    }

    const facilities = await prisma.medicalFacility.findMany({
      where: { districtName },
      include: { departments: true }
    })

    return NextResponse.json({
      score,
      facilities,
      facilityCount: facilities.length
    })
  } catch (error) {
    console.error('Error fetching district scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch district scores' },
      { status: 500 }
    )
  }
}
