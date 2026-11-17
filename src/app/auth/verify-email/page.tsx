'use client'

export const dynamic = 'force-dynamic'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { AuthSuspense } from '@/components/auth/auth-suspense'

function VerifyEmailPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid or missing verification token')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const result = await response.json()

        if (!response.ok) {
          setStatus('error')
          setMessage(result.message || 'Verification failed')
          return
        }

        setStatus('success')
        setMessage(result.message || 'Email verified successfully!')
      } catch {
        setStatus('error')
        setMessage('Something went wrong')
      }
    }

    verifyEmail()
  }, [token])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth/signin">Sign in to your account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle>Verification Failed</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" asChild>
            <Link href="/auth/resend-verification">Resend verification email</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signin">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthSuspense>
      <VerifyEmailPageContent />
    </AuthSuspense>
  )
}