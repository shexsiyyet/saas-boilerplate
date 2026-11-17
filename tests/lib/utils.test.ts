import { describe, it, expect } from 'vitest'
import { cn, formatPrice, formatDate, getInitials, slugify, truncate, sleep } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('merges tailwind classes correctly', () => {
      expect(cn('p-2 p-4')).toBe('p-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('formatPrice', () => {
    it('formats price in cents to dollars', () => {
      expect(formatPrice(2900)).toBe('$29.00')
      expect(formatPrice(0)).toBe('$0.00')
      expect(formatPrice(100)).toBe('$1.00')
    })

    it('supports different currencies', () => {
      expect(formatPrice(2900, 'EUR')).toContain('€')
      expect(formatPrice(2900, 'GBP')).toContain('£')
    })

    it('supports different locales', () => {
      const result = formatPrice(2900, 'USD', 'de-DE')
      expect(result).toContain('29')
    })
  })

  describe('formatDate', () => {
    it('formats date string', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('2024')
      expect(result).toContain('Jan')
    })

    it('formats Date object', () => {
      const result = formatDate(new Date('2024-06-20'))
      expect(result).toContain('2024')
      expect(result).toContain('Jun')
    })
  })

  describe('getInitials', () => {
    it('gets initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Alice')).toBe('A')
      expect(getInitials('John Jacob Smith')).toBe('JJ')
    })

    it('handles edge cases', () => {
      expect(getInitials('')).toBe('')
      expect(getInitials('  ')).toBe('')
    })
  })

  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Hello  World')).toBe('hello-world')
      expect(slugify('Hello@World!')).toBe('helloworld')
    })

    it('handles special characters', () => {
      expect(slugify('Test@#$%^&*()')).toBe('test')
    })
  })

  describe('truncate', () => {
    it('truncates long text', () => {
      expect(truncate('Hello World', 8)).toBe('Hello Wo...')
      expect(truncate('Hi', 10)).toBe('Hi')
    })

    it('handles exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })
  })

  describe('sleep', () => {
    it('resolves after delay', async () => {
      const start = Date.now()
      await sleep(50)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(40)
    })
  })
})