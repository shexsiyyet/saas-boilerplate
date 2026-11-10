import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnAuth = req.nextUrl.pathname.startsWith('/auth')
  const isOnApi = req.nextUrl.pathname.startsWith('/api')

  if (isOnDashboard) {
    if (!isLoggedIn) {
      const signInUrl = new URL('/auth/signin', req.nextUrl)
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/api/:path*'],
}