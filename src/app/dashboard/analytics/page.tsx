'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { formatDate } from '@/lib/utils'

const usageData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  calls: Math.floor(Math.random() * 500) + 100,
  errors: Math.floor(Math.random() * 20),
  latency: Math.floor(Math.random() * 200) + 50,
}))

const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
  calls: Math.floor(Math.random() * 10000) + 2000,
  users: Math.floor(Math.random() * 100) + 10,
}))

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Monitor your API usage and performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">API Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,345</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127ms</div>
                <p className="text-xs text-muted-foreground">-5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.23%</div>
                <p className="text-xs text-muted-foreground">+0.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Calls (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageData}>
                      <defs>
                        <linearGradient id="colorApiCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorApiCalls)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Daily API Usage (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Error Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="latency" stroke="hsl(var(--accent))" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Endpoint</th>
                      <th className="text-left p-4 font-medium">Calls</th>
                      <th className="text-left p-4 font-medium">Avg Latency</th>
                      <th className="text-left p-4 font-medium">Error Rate</th>
                      <th className="text-left p-4 font-medium">P95 Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { endpoint: 'GET /api/users', calls: 5432, avgLatency: '127ms', errorRate: '0.1%', p95: '245ms' },
                      { endpoint: 'POST /api/auth/login', calls: 2341, avgLatency: '89ms', errorRate: '0.3%', p95: '156ms' },
                      { endpoint: 'GET /api/analytics', calls: 1876, avgLatency: '234ms', errorRate: '0.2%', p95: '412ms' },
                      { endpoint: 'POST /api/webhooks/stripe', calls: 567, avgLatency: '45ms', errorRate: '0%', p95: '78ms' },
                      { endpoint: 'GET /api/usage', calls: 3421, avgLatency: '67ms', errorRate: '0.1%', p95: '123ms' },
                    ].map((row) => (
                      <tr key={row.endpoint} className="border-b last:border-0">
                        <td className="p-4 font-mono text-sm">{row.endpoint}</td>
                        <td className="p-4">{row.calls.toLocaleString()}</td>
                        <td className="p-4">{row.avgLatency}</td>
                        <td className="p-4">{row.errorRate}</td>
                        <td className="p-4">{row.p95}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}