import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Handle build-time when DATABASE_URL is not available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const usage = await prisma.usage.findUnique({
      where: { userId: session.user.id },
    })

    if (!usage) {
      return NextResponse.json({ count: 0, limit: 100, remaining: 100 })
    }

    const isNewPeriod = new Date(usage.period).getMonth() !== new Date().getMonth()

    if (isNewPeriod) {
      const updated = await prisma.usage.update({
        where: { userId: session.user.id },
        data: { count: 0, period: new Date() },
      })
      return NextResponse.json({
        count: updated.count,
        limit: updated.limit,
        remaining: updated.limit - updated.count,
      })
    }

    return NextResponse.json({
      count: usage.count,
      limit: usage.limit,
      remaining: Math.max(0, usage.limit - usage.count),
    })
  } catch (error) {
    console.error('Usage fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { increment = 1 } = await request.json()

    const usage = await prisma.usage.findUnique({
      where: { userId: session.user.id },
    })

    if (!usage) {
      return NextResponse.json({ message: 'Usage record not found' }, { status: 404 })
    }

    const isNewPeriod = new Date(usage.period).getMonth() !== new Date().getMonth()
    const newCount = isNewPeriod ? increment : usage.count + increment
    const newPeriod = isNewPeriod ? new Date() : usage.period

    if (newCount > usage.limit) {
      return NextResponse.json(
        { message: 'Usage limit exceeded', limit: usage.limit, remaining: 0 },
        { status: 429 }
      )
    }

    const updated = await prisma.usage.update({
      where: { userId: session.user.id },
      data: { count: newCount, period: newPeriod },
    })

    return NextResponse.json({
      count: updated.count,
      limit: updated.limit,
      remaining: Math.max(0, updated.limit - updated.count),
    })
  } catch (error) {
    console.error('Usage increment error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}