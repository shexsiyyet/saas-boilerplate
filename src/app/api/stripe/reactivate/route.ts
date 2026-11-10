import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reactivateSubscription } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json({ message: 'No subscription found' }, { status: 400 })
    }

    await reactivateSubscription(subscription.stripeSubscriptionId)

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reactivate subscription error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}