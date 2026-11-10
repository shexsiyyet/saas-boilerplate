'use client'

import * as React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  )
}