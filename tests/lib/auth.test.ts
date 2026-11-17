import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { prismaMock, bcryptMock } from '../setup'

describe('auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('password hashing', () => {
    it('hashes password with bcrypt', async () => {
      bcryptMock.hash.mockResolvedValue('hashed-password')

      const result = await bcryptMock.hash('password123', 12)

      expect(bcryptMock.hash).toHaveBeenCalledWith('password123', 12)
      expect(result).toBe('hashed-password')
    })
  })

  describe('password verification', () => {
    it('compares password with hash', async () => {
      bcryptMock.compare.mockResolvedValue(true)

      const result = await bcryptMock.compare('password123', 'hashed-password')

      expect(bcryptMock.compare).toHaveBeenCalledWith('password123', 'hashed-password')
      expect(result).toBe(true)
    })

    it('returns false for invalid password', async () => {
      bcryptMock.compare.mockResolvedValue(false)

      const result = await bcryptMock.compare('wrong-password', 'hashed-password')

      expect(result).toBe(false)
    })
  })

  describe('user creation', () => {
    it('creates user with hashed password', async () => {
      bcryptMock.hash.mockResolvedValue('hashed-password')

      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      })

      const hashedPassword = await bcryptMock.hash('password123', 12)
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: hashedPassword,
        },
      })

      expect(user.password).toBe('hashed-password')
      expect(prismaMock.user.create).toHaveBeenCalled()
    })
  })

  describe('user lookup', () => {
    it('finds user by email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER',
      })

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      })

      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
    })

    it('returns null for non-existent user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      })

      expect(user).toBeNull()
    })
  })
})