import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Handle build-time when DATABASE_URL is not available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ received: true })
    }

    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ message: 'Missing stripe-signature header' }, { status: 400 })
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ message: 'Webhook signature verification failed' }, { status: 400 })
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id
        const status = subscription.status
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
        const cancelAtPeriodEnd = subscription.cancel_at_period_end

        const userSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (userSubscription) {
          let plan = 'FREE'
          if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY || priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
            plan = 'PRO'
          }

          await prisma.subscription.update({
            where: { id: userSubscription.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: currentPeriodEnd,
              plan: plan as any,
              status: status.toUpperCase() as any,
              cancelAtPeriodEnd,
            },
          })

          if (status === 'active' || status === 'trialing') {
            await prisma.user.update({
              where: { id: userSubscription.userId },
              data: { role: plan === 'PRO' ? 'USER' : 'USER' },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: 'FREE',
            status: 'CANCELED',
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'PAST_DUE' },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}