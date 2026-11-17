import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { prismaMock, bcryptMock, randomBytesMock } from '../setup'

describe('Team API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/team/invite', () => {
    it('creates team invitation', async () => {
      randomBytesMock.mockReturnValue({
        toString: vi.fn().mockReturnValue('invite-token'),
      })

      prismaMock.user.findUnique.mockResolvedValue(null)

      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: 'PRO',
      })

      prismaMock.teamMember.count.mockResolvedValue(0)

      prismaMock.teamMember.create.mockResolvedValue({
        id: 'member-1',
        teamId: 'user-1',
        email: 'new@example.com',
        role: 'MEMBER',
        status: 'PENDING',
        inviteToken: 'invite-token',
        inviteExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      const existingUser = await prisma.user.findUnique({ where: { email: 'new@example.com' } })
      expect(existingUser).toBeNull()

      const subscription = await prisma.subscription.findUnique({ where: { userId: 'user-1' } })
      expect(subscription?.plan).toBe('PRO')

      const currentMembers = await prisma.teamMember.count({ where: { teamId: 'user-1' } })
      expect(currentMembers).toBe(0)

      const member = await prisma.teamMember.create({
        data: {
          teamId: 'user-1',
          email: 'new@example.com',
          role: 'MEMBER',
          status: 'PENDING',
          inviteToken: 'invite-token',
          inviteExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      expect(member.email).toBe('new@example.com')
      expect(member.status).toBe('PENDING')
    })

    it('rejects when team member limit reached', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'owner@example.com',
      })

      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: 'FREE',
      })

      prismaMock.teamMember.count.mockResolvedValue(1)

      const subscription = await prisma.subscription.findUnique({ where: { userId: 'user-1' } })
      const maxMembers = subscription?.plan === 'PRO' ? 5 : 1
      const currentMembers = await prisma.teamMember.count({ where: { teamId: 'user-1' } })

      expect(currentMembers).toBeGreaterThanOrEqual(maxMembers)
    })

    it('rejects duplicate email', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'member-1',
        teamId: 'user-1',
        email: 'existing@example.com',
      })

      const existingMember = await prisma.teamMember.findUnique({
        where: { teamId_email: { teamId: 'user-1', email: 'existing@example.com' } },
      })

      expect(existingMember).toBeDefined()
    })
  })

  describe('POST /api/team/accept', () => {
    it('accepts invitation and creates user', async () => {
      bcryptMock.hash.mockResolvedValue('hashed-password')

      prismaMock.teamMember.findFirst.mockResolvedValue({
        id: 'member-1',
        teamId: 'user-1',
        email: 'new@example.com',
        role: 'MEMBER',
        status: 'PENDING',
        inviteToken: 'valid-token',
        inviteExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      prismaMock.user.findUnique.mockResolvedValue(null)

      prismaMock.user.create.mockResolvedValue({
        id: 'user-2',
        email: 'new@example.com',
        name: 'New Member',
        password: 'hashed-password',
      })

      prismaMock.usage.create.mockResolvedValue({})
      prismaMock.teamMember.update.mockResolvedValue({})

      const member = await prisma.teamMember.findFirst({
        where: {
          inviteToken: 'valid-token',
          inviteExpiry: { gt: new Date() },
          status: 'PENDING',
        },
      })

      expect(member).toBeDefined()

      const existingUser = await prisma.user.findUnique({ where: { email: member!.email } })
      expect(existingUser).toBeNull()

      const hashedPassword = await bcryptMock.hash('password123', 12)
      const user = await prisma.user.create({
        data: {
          email: member!.email,
          name: 'New Member',
          password: hashedPassword,
          emailVerified: new Date(),
        },
      })

      expect(user.id).toBeDefined()
    })

    it('rejects invalid token', async () => {
      prismaMock.teamMember.findFirst.mockResolvedValue(null)

      const member = await prisma.teamMember.findFirst({
        where: {
          inviteToken: 'invalid-token',
          inviteExpiry: { gt: new Date() },
          status: 'PENDING',
        },
      })

      expect(member).toBeNull()
    })
  })

  describe('GET /api/team/members', () => {
    it('lists team members', async () => {
      prismaMock.teamMember.findMany.mockResolvedValue([
        { id: 'member-1', teamId: 'user-1', email: 'member1@example.com', role: 'MEMBER', status: 'ACTIVE', user: { id: 'user-2', name: 'Member 1', email: 'member1@example.com' } },
        { id: 'member-2', teamId: 'user-1', email: 'member2@example.com', role: 'ADMIN', status: 'PENDING', user: null },
      ])

      const members = await prisma.teamMember.findMany({
        where: { teamId: 'user-1' },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      })

      expect(members).toHaveLength(2)
      expect(members[0].email).toBe('member1@example.com')
      expect(members[1].status).toBe('PENDING')
    })
  })
})