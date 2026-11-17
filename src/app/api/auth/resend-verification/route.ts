import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'
import { authRateLimit } from '@/lib/rate-limit'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await authRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: 'If the email exists, a verification link has been sent' })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified' }, { status: 400 })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    })

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: email,
        subject: 'Verify your email address',
        html: `
          <p>Welcome! Please verify your email address.</p>
          <p><a href="${verificationUrl}">Click here to verify your email</a></p>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        `,
      })
    } else {
      console.log('📧 Email verification (dev mode):', verificationUrl)
    }

    return NextResponse.json({ message: 'If the email exists, a verification link has been sent' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}