import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authRateLimit } from '@/lib/rate-limit'

const acceptSchema = z.object({
  token: z.string(),
  name: z.string().min(2),
  password: z.string().min(8),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await authRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }

    const body = await request.json()
    const parsed = acceptSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, name, password } = parsed.data

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        inviteToken: token,
        inviteExpiry: { gt: new Date() },
        status: 'PENDING',
      },
    })

    if (!teamMember) {
      return NextResponse.json({ message: 'Invalid or expired invitation' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: teamMember.email } })
    if (existingUser) {
      await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: { status: 'ACTIVE', userId: existingUser.id },
      })

      return NextResponse.json({ message: 'Account linked to team', user: existingUser })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: teamMember.email,
        name,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    })

    await prisma.usage.create({
      data: { userId: user.id, count: 0, limit: 100 },
    })

    await prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { status: 'ACTIVE', userId: user.id },
    })

    return NextResponse.json({
      message: 'Team invitation accepted',
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}