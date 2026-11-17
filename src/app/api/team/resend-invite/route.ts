import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'
import { authRateLimit } from '@/lib/rate-limit'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await authRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const member = await prisma.teamMember.findUnique({
      where: { id },
    })

    if (!member || member.teamId !== session.user.id) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }

    if (member.status === 'ACTIVE') {
      return NextResponse.json({ message: 'Member is already active' }, { status: 400 })
    }

    const inviteToken = crypto.randomBytes(32).toString('hex')
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.teamMember.update({
      where: { id },
      data: { inviteToken, inviteExpiry },
    })

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team/accept?token=${inviteToken}`

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: member.email,
        subject: `Invitation to join ${session.user.name || 'a team'}`,
        html: `
          <p>You've been invited to join a team as ${member.role.toLowerCase()}.</p>
          <p><a href="${inviteUrl}">Accept invitation</a></p>
          <p>This invitation expires in 7 days.</p>
        `,
      })
    } else {
      console.log('📧 Resend team invitation (dev mode):', inviteUrl)
    }

    return NextResponse.json({ message: 'Invitation resent successfully' })
  } catch (error) {
    console.error('Resend invitation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}