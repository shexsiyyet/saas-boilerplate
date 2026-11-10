'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('lg:pl-64', 'transition-all duration-200')}>
        <Header user={user} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}