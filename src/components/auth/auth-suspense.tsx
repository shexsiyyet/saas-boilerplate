'use client'

import * as React from 'react'

export function AuthSuspense({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {children}
    </React.Suspense>
  )
}