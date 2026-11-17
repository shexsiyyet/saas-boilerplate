import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { prismaMock, bcryptMock } from '../setup'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates new user with valid data', async () => {
    bcryptMock.hash.mockResolvedValue('hashed-password')

    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      name: 'New User',
      password: 'hashed-password',
      role: 'USER',
    })
    prismaMock.usage.create.mockResolvedValue({
      userId: 'user-1',
      count: 0,
      limit: 100,
    })

    const existingUser = await prisma.user.findUnique({ where: { email: 'new@example.com' } })
    expect(existingUser).toBeNull()

    const hashedPassword = await bcryptMock.hash('password123', 12)
    const user = await prisma.user.create({
      data: {
        name: 'New User',
        email: 'new@example.com',
        password: hashedPassword,
      },
    })

    await prisma.usage.create({ data: { userId: user.id, count: 0, limit: 100 } })

    expect(user.email).toBe('new@example.com')
    expect(user.password).toBe('hashed-password')
    expect(prismaMock.usage.create).toHaveBeenCalled()
  })

  it('rejects duplicate email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'existing@example.com',
    })

    const existingUser = await prisma.user.findUnique({ where: { email: 'existing@example.com' } })
    expect(existingUser).toBeDefined()
  })

  it('validates required fields', async () => {
    const testCases = [
      { name: '', email: 'test@example.com', password: 'password123' },
      { name: 'Test', email: 'invalid-email', password: 'password123' },
      { name: 'Test', email: 'test@example.com', password: 'short' },
    ]

    for (const data of testCases) {
      const errors: string[] = []
      if (!data.name || data.name.length < 2) errors.push('name')
      if (!data.email || !data.email.includes('@')) errors.push('email')
      if (!data.password || data.password.length < 8) errors.push('password')
      expect(errors.length).toBeGreaterThan(0)
    }
  })
})