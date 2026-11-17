import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { apiRateLimit } from '@/lib/rate-limit'

const updateMemberSchema = z.object({
  role: z.enum(['MEMBER', 'ADMIN']).optional(),
})

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
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
    const body = await request.json()
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const member = await prisma.teamMember.findUnique({
      where: { id },
    })

    if (!member || member.teamId !== session.user.id) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }

    if (member.role === 'OWNER') {
      return NextResponse.json({ message: 'Cannot modify owner role' }, { status: 400 })
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json({ member: updated })
  } catch (error) {
    console.error('Update team member error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
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

    if (member.role === 'OWNER') {
      return NextResponse.json({ message: 'Cannot remove owner' }, { status: 400 })
    }

    await prisma.teamMember.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Remove team member error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}