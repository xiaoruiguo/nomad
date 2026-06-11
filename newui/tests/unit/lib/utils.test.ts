import { describe, it, expect } from 'vitest'
import { cn, formatBytes, formatMHz, formatTime, formatDuration, truncateMiddle, statusColor, allocationStatusColor } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
})

describe('formatBytes', () => {
  it('formats zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB')
  })

  it('respects decimal places', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB')
    expect(formatBytes(1536, 1)).toBe('1.5 KB')
  })
})

describe('formatMHz', () => {
  it('formats MHz values under 1000', () => {
    expect(formatMHz(500)).toBe('500 MHz')
  })

  it('formats GHz for values >= 1000', () => {
    expect(formatMHz(1000)).toBe('1.00 GHz')
  })

  it('formats fractional GHz', () => {
    expect(formatMHz(2500)).toBe('2.50 GHz')
  })
})

describe('formatTime', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date().toISOString()
    expect(formatTime(now)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatTime(fiveMinAgo)).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(formatTime(threeHoursAgo)).toBe('3h ago')
  })

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTime(twoDaysAgo)).toBe('2d ago')
  })

  it('returns formatted date for older times', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatTime(date)
    expect(result).not.toContain('ago')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  it('formats seconds', () => {
    expect(formatDuration(5000)).toBe('5s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125000)).toBe('2m 5s')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(7500000)).toBe('2h 5m')
  })

  it('formats days and hours', () => {
    expect(formatDuration(93600000)).toBe('1d 2h')
  })
})

describe('truncateMiddle', () => {
  it('returns string unchanged if shorter than maxLen', () => {
    expect(truncateMiddle('hello', 10)).toBe('hello')
  })

  it('truncates long strings with ellipsis in middle', () => {
    expect(truncateMiddle('abcdefghij', 7)).toBe('ab...ij')
  })

  it('handles exact length', () => {
    expect(truncateMiddle('hello', 5)).toBe('hello')
  })

  it('handles very short maxLen', () => {
    const result = truncateMiddle('abcdefghij', 5)
    expect(result).toContain('...')
    expect(result.length).toBe(5)
  })
})

describe('statusColor', () => {
  it('returns green for running', () => {
    expect(statusColor('running')).toBe('text-green-600')
  })

  it('returns green for success', () => {
    expect(statusColor('success')).toBe('text-green-600')
  })

  it('returns yellow for pending', () => {
    expect(statusColor('pending')).toBe('text-yellow-600')
  })

  it('returns red for failed', () => {
    expect(statusColor('failed')).toBe('text-red-600')
  })

  it('returns red for dead', () => {
    expect(statusColor('dead')).toBe('text-red-600')
  })

  it('returns gray for unknown', () => {
    expect(statusColor('unknown')).toBe('text-gray-500')
  })

  it('returns gray for unrecognized status', () => {
    expect(statusColor('something-else')).toBe('text-gray-500')
  })

  it('is case insensitive', () => {
    expect(statusColor('Running')).toBe('text-green-600')
  })
})

describe('allocationStatusColor', () => {
  it('returns green for running', () => {
    expect(allocationStatusColor('running')).toBe('text-green-600')
  })

  it('returns blue for complete', () => {
    expect(allocationStatusColor('complete')).toBe('text-blue-600')
  })

  it('returns yellow for pending', () => {
    expect(allocationStatusColor('pending')).toBe('text-yellow-600')
  })

  it('returns red for failed', () => {
    expect(allocationStatusColor('failed')).toBe('text-red-600')
  })

  it('returns gray for unknown', () => {
    expect(allocationStatusColor('unknown')).toBe('text-gray-500')
  })

  it('returns gray for unrecognized status', () => {
    expect(allocationStatusColor('other')).toBe('text-gray-500')
  })
})
