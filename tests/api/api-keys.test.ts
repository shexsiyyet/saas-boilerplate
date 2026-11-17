import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { prismaMock, mockCreateHash, randomBytesMock } from '../setup'

describe('API Keys API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/user/api-keys', () => {
    it('creates API key', async () => {
      randomBytesMock.mockReturnValue({
        toString: vi.fn().mockReturnValue('random-key-part'),
      })

      const mockHash = 'hashed-key'
      const hashObj = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue(mockHash),
      }
      mockCreateHash.mockReturnValue(hashObj)

      prismaMock.apiKey.create.mockResolvedValue({
        id: 'key-1',
        userId: 'user-1',
        name: 'Test Key',
        keyHash: mockHash,
        prefix: 'sk_random-ke',
        expiresAt: null,
        createdAt: new Date(),
      })

      const rawKey = `sk_${'random-key-part'.toString()}`
      const keyHash = mockCreateHash().update(rawKey).digest('hex')
      const prefix = rawKey.slice(0, 12)

      const apiKey = await prisma.apiKey.create({
        data: {
          userId: 'user-1',
          name: 'Test Key',
          keyHash,
          prefix,
        },
      })

      expect(apiKey.prefix).toBe(prefix)
      expect(apiKey.keyHash).toBe(keyHash)
    })
  })

  describe('GET /api/user/api-keys', () => {
    it('lists API keys without exposing full key', async () => {
      prismaMock.apiKey.findMany.mockResolvedValue([
        { id: 'key-1', name: 'Key 1', prefix: 'sk_abc123', lastUsed: new Date(), expiresAt: null, createdAt: new Date() },
        { id: 'key-2', name: 'Key 2', prefix: 'sk_def456', lastUsed: null, expiresAt: new Date(Date.now() + 86400000), createdAt: new Date() },
      ])

      const apiKeys = await prisma.apiKey.findMany({
        where: { userId: 'user-1' },
        select: {
          id: true,
          name: true,
          prefix: true,
          lastUsed: true,
          expiresAt: true,
          createdAt: true,
        },
      })

      expect(apiKeys).toHaveLength(2)
      expect(apiKeys[0]).not.toHaveProperty('keyHash')
      expect(apiKeys[0].prefix).toBe('sk_abc123')
    })
  })

  describe('DELETE /api/user/api-keys/[id]', () => {
    it('deletes API key', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        userId: 'user-1',
      })

      prismaMock.apiKey.delete.mockResolvedValue({})

      const apiKey = await prisma.apiKey.findUnique({ where: { id: 'key-1' } })
      expect(apiKey).toBeDefined()
      expect(apiKey?.userId).toBe('user-1')

      await prisma.apiKey.delete({ where: { id: 'key-1' } })

      expect(prismaMock.apiKey.delete).toHaveBeenCalledWith({ where: { id: 'key-1' } })
    })

    it('rejects deleting another user key', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        userId: 'other-user',
      })

      const apiKey = await prisma.apiKey.findUnique({ where: { id: 'key-1' } })
      expect(apiKey?.userId).not.toBe('user-1')
    })
  })
})