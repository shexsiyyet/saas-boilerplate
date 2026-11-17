import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { Resend } from 'resend'
import { authRateLimit } from '@/lib/rate-limit'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['MEMBER', 'ADMIN']),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, role } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    const maxMembers = subscription?.plan === 'PRO' ? 5 : 1
    const currentMembers = await prisma.teamMember.count({
      where: { teamId: session.user.id },
    })

    if (currentMembers >= maxMembers) {
      return NextResponse.json(
        { message: `Team member limit reached (${maxMembers} for ${subscription?.plan || 'FREE'} plan)` },
        { status: 400 }
      )
    }

    const inviteToken = crypto.randomBytes(32).toString('hex')
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: session.user.id,
        email,
        role,
        status: 'PENDING',
        inviteToken,
        inviteExpiry,
      },
    })

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team/accept?token=${inviteToken}`

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: email,
        subject: `You've been invited to join ${session.user.name || 'a team'}`,
        html: `
          <p>You've been invited to join a team as ${role.toLowerCase()}.</p>
          <p><a href="${inviteUrl}">Accept invitation</a></p>
          <p>This invitation expires in 7 days.</p>
        `,
      })
    } else {
      console.log('📧 Team invitation (dev mode):', inviteUrl)
    }

    return NextResponse.json({
      message: 'Invitation sent successfully',
      teamMember: { id: teamMember.id, email: teamMember.email, role: teamMember.role, status: teamMember.status },
    })
  } catch (error) {
    console.error('Team invite error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}