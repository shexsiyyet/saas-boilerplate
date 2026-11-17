import { vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'

declare global {
  namespace Vi {
    interface Mock<T = any> extends vi.Mock<T> {}
  }
}

// Mock PrismaClient type
export type MockedPrismaClient = {
  [K in keyof PrismaClient]: PrismaClient[K] extends (...args: any[]) => any
    ? vi.Mock<ReturnType<PrismaClient[K]>, Parameters<PrismaClient[K]>>
    : never
} & {
  user: {
    findUnique: vi.Mock
    findFirst: vi.Mock
    create: vi.Mock
    update: vi.Mock
    delete: vi.Mock
    count: vi.Mock
  }
  subscription: {
    findUnique: vi.Mock
    findMany: vi.Mock
    create: vi.Mock
    update: vi.Mock
    upsert: vi.Mock
    updateMany: vi.Mock
    count: vi.Mock
  }
  usage: {
    findUnique: vi.Mock
    create: vi.Mock
    update: vi.Mock
    upsert: vi.Mock
  }
  account: {
    findUnique: vi.Mock
  }
  session: {
    findUnique: vi.Mock
  }
  teamMember: {
    findUnique: vi.Mock
    findFirst: vi.Mock
    findMany: vi.Mock
    create: vi.Mock
    update: vi.Mock
    delete: vi.Mock
    count: vi.Mock
  }
  apiKey: {
    findUnique: vi.Mock
    findMany: vi.Mock
    create: vi.Mock
    delete: vi.Mock
  }
  emailVerificationToken: {
    findUnique: vi.Mock
    create: vi.Mock
    delete: vi.Mock
  }
}