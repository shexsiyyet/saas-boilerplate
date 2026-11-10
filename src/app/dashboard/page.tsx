import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  CreditCard,
  BarChart3,
  Activity,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'

async function getStats() {
  const [totalUsers, totalSubscriptions, activeSubscriptions, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ])

  return { totalUsers, totalSubscriptions, activeSubscriptions, recentUsers }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    return <div>Loading...</div>
  }
  const stats = await getStats()

  const [subscription, usage, user] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.usage.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { createdAt: true } }),
  ])

  const planName = subscription?.plan || 'FREE'
  const isPro = planName === 'PRO'
  const usageCount = usage?.count || 0
  const usageLimit = usage?.limit || 100

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name || 'User'}. Here's what's happening with your account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Plan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planName}</div>
            <p className="text-xs text-muted-foreground">
              {isPro ? 'Active subscription' : 'Free tier'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageCount} / {usageLimit}</div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (usageCount / usageLimit) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {usageLimit - usageCount} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Cycle</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.stripeCurrentPeriodEnd
                ? formatDate(subscription.stripeCurrentPeriodEnd)
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renews'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(user?.createdAt || new Date())}
            </div>
            <p className="text-xs text-muted-foreground">Account created</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Manage your subscription, payment methods, and view invoice history.
            </p>
            <Button asChild>
              <Link href="/dashboard/billing">Manage Billing</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View your usage analytics, API calls, and performance metrics.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API & Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate API keys, configure webhooks, and manage integrations.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (Admin only) */}
      {(session?.user?.role === 'ADMIN') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Users
              <span className="text-sm font-normal text-muted-foreground">
                {stats.totalUsers} total users
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Plan</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="p-4">
                        <div className="font-medium">{user.name || 'Unnamed'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{user.role === 'ADMIN' ? 'Enterprise' : 'Free'}</span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}