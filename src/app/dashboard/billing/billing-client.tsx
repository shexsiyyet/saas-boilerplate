'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, X, Loader2, CreditCard, Receipt, Settings, ArrowRight } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: ['Up to 100 API calls/month', 'Community support', 'Basic dashboard', '1 team member'],
    limits: { apiCalls: 100, teamMembers: 1 },
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 2900,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || 'price_monthly',
    features: ['Up to 10,000 API calls/month', 'Priority email support', 'Advanced analytics', '5 team members', 'Custom domains', 'API access'],
    limits: { apiCalls: 10000, teamMembers: 5 },
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: 29000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || 'price_yearly',
    features: ['Everything in Monthly', '2 months free', 'Priority support', 'Advanced analytics', '5 team members', 'Custom domains', 'API access'],
    limits: { apiCalls: 10000, teamMembers: 5 },
  },
]

interface SubscriptionData {
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
}

interface BillingClientProps {
  initialSubscription: SubscriptionData
  initialUsage: { count: number; limit: number; remaining: number }
}

export function BillingClient({ initialSubscription, initialUsage }: BillingClientProps) {
  const router = useRouter()
  const [subscription, setSubscription] = React.useState(initialSubscription)
  const [usage, setUsage] = React.useState(initialUsage)
  const [loading, setLoading] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('plans')

  const isPro = subscription.plan === 'PRO'
  const currentPlan = PLANS.find(p => p.id === (isPro ? 'pro_monthly' : 'free')) || PLANS[0]

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to create checkout', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    setLoading('portal')
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to open billing portal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose Pro features at the end of the billing period.')) return
    setLoading('cancel')
    try {
      const response = await fetch('/api/stripe/cancel', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: true }))
        toast({ title: 'Success', description: 'Subscription will cancel at period end' })
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to cancel', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const handleReactivate = async () => {
    setLoading('reactivate')
    try {
      const response = await fetch('/api/stripe/reactivate', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: false }))
        toast({ title: 'Success', description: 'Subscription reactivated' })
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to reactivate', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Plan
            <Badge variant={isPro ? 'default' : 'secondary'}>
              {isPro ? 'Pro' : 'Free'}
            </Badge>
          </CardTitle>
          <CardDescription>Your current subscription status and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{subscription.status.toLowerCase()}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="font-medium">
                {subscription.currentPeriodEnd
                  ? formatDate(subscription.currentPeriodEnd)
                  : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Usage</p>
              <p className="font-medium">{usage.count} / {usage.limit} API calls</p>
            </div>
          </div>

          <Separator />

          {isPro && subscription.cancelAtPeriodEnd && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="font-medium">Subscription cancels on {formatDate(subscription.currentPeriodEnd!)}</p>
                <p className="text-sm text-muted-foreground">You'll lose Pro features after this date</p>
              </div>
              <Button variant="outline" onClick={handleReactivate} disabled={loading === 'reactivate'}>
                {loading === 'reactivate' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reactivate'}
              </Button>
            </div>
          )}

          {isPro && !subscription.cancelAtPeriodEnd && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Your subscription is active and will renew automatically</p>
                <p className="text-sm text-muted-foreground">Next billing: {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'N/A'}</p>
              </div>
              <Button variant="outline" onClick={handleCancel} disabled={loading === 'cancel'}>
                {loading === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Subscription'}
              </Button>
            </div>
          )}

          {!isPro && (
            <Button onClick={() => setActiveTab('plans')}>
              Upgrade to Pro
            </Button>
          )}

          {subscription.stripeCustomerId && (
            <Button variant="outline" onClick={handlePortal} disabled={loading === 'portal'}>
              <Settings className="mr-2 h-4 w-4" />
              {loading === 'portal' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Manage Billing in Stripe'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isCurrent = (isPro && plan.id.startsWith('pro')) || (!isPro && plan.id === 'free')
              const isUpgrade = !isPro && plan.id !== 'free'
              return (
                <Card key={plan.id} className={`relative ${isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant={isPro ? 'default' : 'secondary'}>Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                      {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                    </div>
                    {plan.id === 'pro_yearly' && (
                      <Badge variant="secondary" className="mt-2">Save 17%</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? 'outline' : isUpgrade ? 'default' : 'outline'}
                      disabled={isCurrent || loading === plan.priceId}
                      onClick={() => isUpgrade && handleCheckout(plan.priceId!)}
                    >
                      {loading === plan.priceId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : plan.price === 0 ? (
                        'Downgrade'
                      ) : (
                        <>
                          Upgrade to {plan.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Your past invoices and receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 text-muted-foreground" colSpan={4}>
                        No invoices yet. Invoices will appear here after your first payment.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment method in Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Payment methods are managed securely through Stripe.
                </p>
                <Button onClick={handlePortal} disabled={loading === 'portal'}>
                  {loading === 'portal' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Manage in Stripe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}