export const dynamic = 'force-dynamic'

import { SignUpForm } from '@/components/auth/sign-up-form'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
      <SignUpForm />
    </div>
  )
}