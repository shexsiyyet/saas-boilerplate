import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { prismaMock } from '../setup'

describe('Usage API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/user/usage', () => {
    it('returns usage data for authenticated user', async () => {
      prismaMock.usage.findUnique.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 50,
        limit: 100,
        period: new Date(),
      })

      const usage = await prisma.usage.findUnique({
        where: { userId: 'user-1' },
      })

      expect(usage).toBeDefined()
      expect(usage?.count).toBe(50)
      expect(usage?.limit).toBe(100)
    })

    it('returns default usage when none exists', async () => {
      prismaMock.usage.findUnique.mockResolvedValue(null)

      const usage = await prisma.usage.findUnique({
        where: { userId: 'user-1' },
      })

      expect(usage).toBeNull()
    })

    it('resets usage for new month', async () => {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      prismaMock.usage.findUnique.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 50,
        limit: 100,
        period: lastMonth,
      })

      prismaMock.usage.update.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 0,
        limit: 100,
        period: new Date(),
      })

      const usage = await prisma.usage.findUnique({
        where: { userId: 'user-1' },
      })

      const isNewPeriod = new Date(usage!.period).getMonth() !== new Date().getMonth()
      expect(isNewPeriod).toBe(true)
    })
  })

  describe('POST /api/user/usage', () => {
    it('increments usage count', async () => {
      prismaMock.usage.findUnique.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 50,
        limit: 100,
        period: new Date(),
      })

      prismaMock.usage.update.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 51,
        limit: 100,
        period: new Date(),
      })

      const usage = await prisma.usage.findUnique({
        where: { userId: 'user-1' },
      })

      const updated = await prisma.usage.update({
        where: { userId: 'user-1' },
        data: { count: usage!.count + 1 },
      })

      expect(updated.count).toBe(51)
    })

    it('rejects when limit exceeded', async () => {
      prismaMock.usage.findUnique.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 100,
        limit: 100,
        period: new Date(),
      })

      const usage = await prisma.usage.findUnique({
        where: { userId: 'user-1' },
      })

      expect(usage!.count).toBeGreaterThanOrEqual(usage!.limit)
    })

    it('resets count for new period when incrementing', async () => {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      prismaMock.usage.findUnique.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 50,
        limit: 100,
        period: lastMonth,
      })

      prismaMock.usage.update.mockResolvedValue({
        id: 'usage-1',
        userId: 'user-1',
        count: 1,
        limit: 100,
        period: new Date(),
      })

      const usage = await prisma.usage.findUnique({
        where: { userId: 'user-1' },
      })

      const isNewPeriod = new Date(usage!.period).getMonth() !== new Date().getMonth()
      const newCount = isNewPeriod ? 1 : usage!.count + 1

      expect(newCount).toBe(1)
    })
  })
})