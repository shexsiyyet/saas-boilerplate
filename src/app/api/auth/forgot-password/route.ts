import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If the email exists, a reset link has been sent' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: email,
        subject: 'Reset your password',
        html: `
          <p>You requested a password reset.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      })
    } else {
      console.log('📧 Password reset email (dev mode):', resetUrl)
    }

    return NextResponse.json({ message: 'If the email exists, a reset link has been sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}