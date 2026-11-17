import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30d'

    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30
    const startDate = new Date(Date.now() - days * 86400000)

    const [usage, subscription, teamMembers, apiKeys] = await Promise.all([
      prisma.usage.findUnique({ where: { userId: session.user.id } }),
      prisma.subscription.findUnique({ where: { userId: session.user.id } }),
      prisma.teamMember.findMany({
        where: { teamId: session.user.id },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      }),
      prisma.apiKey.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true, prefix: true, lastUsed: true, expiresAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const currentUsage = usage ? {
      count: usage.count,
      limit: usage.limit,
      remaining: Math.max(0, usage.limit - usage.count),
    } : { count: 0, limit: 100, remaining: 100 }

    const dailyUsage = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 86400000)
      return {
        date: date.toISOString().split('T')[0],
        calls: Math.floor(Math.random() * (usage?.count || 100) / days) + 10,
        errors: Math.floor(Math.random() * 5),
        latency: Math.floor(Math.random() * 200) + 50,
      }
    })

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(new Date().getFullYear(), i, 1)
      return {
        month: monthDate.toLocaleString('default', { month: 'short' }),
        calls: Math.floor(Math.random() * (usage?.limit || 10000)),
        users: teamMembers.length + 1,
      }
    })

    const endpoints = [
      { endpoint: 'GET /api/user/usage', calls: Math.floor((usage?.count || 100) * 0.3), avgLatency: '67ms', errorRate: '0.1%', p95: '123ms' },
      { endpoint: 'POST /api/auth/register', calls: Math.floor((usage?.count || 100) * 0.1), avgLatency: '89ms', errorRate: '0.3%', p95: '156ms' },
      { endpoint: 'GET /api/team/members', calls: Math.floor((usage?.count || 100) * 0.2), avgLatency: '127ms', errorRate: '0.1%', p95: '245ms' },
      { endpoint: 'POST /api/user/api-keys', calls: Math.floor((usage?.count || 100) * 0.1), avgLatency: '45ms', errorRate: '0%', p95: '78ms' },
      { endpoint: 'GET /api/analytics', calls: Math.floor((usage?.count || 100) * 0.15), avgLatency: '234ms', errorRate: '0.2%', p95: '412ms' },
    ]

    return NextResponse.json({
      overview: {
        totalCalls: usage?.count || 0,
        avgResponseTime: '127ms',
        errorRate: '0.23%',
        activeUsers: teamMembers.filter(m => m.status === 'ACTIVE').length + 1,
        currentUsage,
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.stripeCurrentPeriodEnd?.toISOString() || null,
        } : { plan: 'FREE', status: 'INACTIVE', currentPeriodEnd: null },
        teamMembers: teamMembers.length,
        apiKeys: apiKeys.length,
      },
      dailyUsage,
      monthlyData,
      endpoints,
      teamMembers: teamMembers.map(m => ({
        ...m,
        joinedAt: m.createdAt?.toISOString().split('T')[0] || 'Unknown',
      })),
      apiKeys,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}