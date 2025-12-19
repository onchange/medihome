import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidDistrict, sanitizeDistrict } from '@/types'

function parsePrice(value: string | null): number | null {
  if (!value) return null
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed < 0) return null
  return parsed
}

function parseLimit(value: string | null, defaultValue: number = 50, maxValue: number = 100): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed < 1) return defaultValue
  return Math.min(parsed, maxValue)
}

function parseOffset(value: string | null): number {
  if (!value) return 0
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed < 0) return 0
  return parsed
}

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

    const { searchParams } = new URL(request.url)
    const minPrice = parsePrice(searchParams.get('minPrice'))
    const maxPrice = parsePrice(searchParams.get('maxPrice'))
    const limit = parseLimit(searchParams.get('limit'))
    const offset = parseOffset(searchParams.get('offset'))

    const where: {
      districtName: string
      tradePrice?: { gte?: number; lte?: number }
    } = {
      districtName,
    }

    if (minPrice !== null || maxPrice !== null) {
      where.tradePrice = {}
      if (minPrice !== null) where.tradePrice.gte = minPrice
      if (maxPrice !== null) where.tradePrice.lte = maxPrice
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.realEstateTransaction.findMany({
        where,
        orderBy: { tradePrice: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.realEstateTransaction.count({ where }),
    ])

    if (transactions.length === 0) {
      return NextResponse.json({
        count: 0,
        totalCount: 0,
        avgPrice: 0,
        medianPrice: 0,
        transactions: [],
      })
    }

    const allPrices = await prisma.realEstateTransaction.findMany({
      where,
      select: { tradePrice: true },
      orderBy: { tradePrice: 'asc' },
    })

    const prices = allPrices.map((t) => t.tradePrice)
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    const medianPrice = prices[Math.floor(prices.length / 2)]

    return NextResponse.json({
      count: transactions.length,
      totalCount,
      avgPrice,
      medianPrice,
      transactions,
      pagination: {
        limit,
        offset,
        hasMore: offset + transactions.length < totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching real estate data:', error)
    const message = process.env.NODE_ENV === 'production'
      ? '不動産データの取得に失敗しました'
      : error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
