import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BillingClient } from './billing-client'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const [subscription, usage] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.usage.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  const subscriptionData = subscription ? {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.stripeCurrentPeriodEnd?.toISOString() || null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeCustomerId: subscription.stripeCustomerId,
  } : {
    plan: 'FREE',
    status: 'INACTIVE',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: null,
  }

  const usageData = usage ? {
    count: usage.count,
    limit: usage.limit,
    remaining: Math.max(0, usage.limit - usage.count),
  } : { count: 0, limit: 100, remaining: 100 }

  return <BillingClient initialSubscription={subscriptionData} initialUsage={usageData} />
}