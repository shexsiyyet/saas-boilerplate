export const dynamic = 'force-dynamic'

import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
      <SignInForm />
    </div>
  )
}