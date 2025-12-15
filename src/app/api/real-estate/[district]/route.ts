import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ district: string }> }
) {
  try {
    const { district } = await context.params
    const districtName = decodeURIComponent(district)

    const { searchParams } = new URL(request.url)
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {
      districtName
    }

    if (minPrice) {
      where.tradePrice = { gte: parseInt(minPrice) }
    }

    if (maxPrice) {
      if (where.tradePrice) {
        where.tradePrice.lte = parseInt(maxPrice)
      } else {
        where.tradePrice = { lte: parseInt(maxPrice) }
      }
    }

    const transactions = await prisma.realEstateTransaction.findMany({
      where,
      orderBy: { tradePrice: 'asc' }
    })

    if (transactions.length === 0) {
      return NextResponse.json({
        count: 0,
        avgPrice: 0,
        medianPrice: 0,
        transactions: []
      })
    }

    const prices = transactions.map(t => t.tradePrice).sort((a, b) => a - b)
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    const medianPrice = prices[Math.floor(prices.length / 2)]

    return NextResponse.json({
      count: transactions.length,
      avgPrice,
      medianPrice,
      transactions: transactions.slice(0, 50)
    })
  } catch (error) {
    console.error('Error fetching real estate data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real estate data' },
      { status: 500 }
    )
  }
}
