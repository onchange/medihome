import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    return NextResponse.json(districts)
  } catch (error) {
    console.error('Error fetching districts:', error)
    const message = process.env.NODE_ENV === 'production'
      ? '地区一覧の取得に失敗しました'
      : error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
