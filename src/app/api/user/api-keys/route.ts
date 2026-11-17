import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { z } from 'zod'
import { apiRateLimit } from '@/lib/rate-limit'

const createApiKeySchema = z.object({
  name: z.string().min(1).max(50),
  expiresAt: z.string().datetime().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('List API keys error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const parsed = createApiKeySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, expiresAt } = parsed.data

    const rawKey = `sk_${crypto.randomBytes(24).toString('base64url')}`
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const prefix = rawKey.slice(0, 12)

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash,
        prefix,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(
      {
        message: 'API key created successfully',
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          prefix: apiKey.prefix,
          key: rawKey, // Only returned once
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}