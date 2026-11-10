'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { AuthSuspense } from '@/components/auth/auth-suspense'

function AuthErrorPageContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access was denied. You may not have permission to sign in.',
    Verification: 'The verification link has expired or has already been used.',
    OAuthSignin: 'Error starting the OAuth sign-in process.',
    OAuthCallback: 'Error in the OAuth callback handler.',
    OAuthCreateAccount: 'Could not create OAuth account.',
    EmailCreateAccount: 'Could not create email account.',
    Callback: 'Error in the OAuth callback handler.',
    OAuthAccountNotLinked: 'This email is already associated with another account.',
    EmailSignin: 'Error sending the email sign-in link.',
    CredentialsSignin: 'Sign in failed. Check your credentials.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An authentication error occurred.',
  }

  const message = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="space-y-3">
          <Button asChild>
            <Link href="/auth/signin">Try signing in again</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
        {error && (
          <p className="mt-6 text-xs text-muted-foreground font-mono">
            Error code: {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <AuthSuspense>
      <AuthErrorPageContent />
    </AuthSuspense>
  )
}