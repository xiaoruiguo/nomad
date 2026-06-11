import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function formatMHz(mhz: number): string {
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(2)} GHz`
  }
  return `${mhz} MHz`
}

export function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function truncateMiddle(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  const frontLen = Math.ceil((maxLen - 3) / 2)
  const backLen = Math.floor((maxLen - 3) / 2)
  return `${str.slice(0, frontLen)}...${str.slice(str.length - backLen)}`
}

const STATUS_COLOR_MAP: Record<string, string> = {
  running: 'text-green-600',
  success: 'text-green-600',
  healthy: 'text-green-600',
  eligible: 'text-green-600',
  complete: 'text-blue-600',
  pending: 'text-yellow-600',
  queued: 'text-yellow-600',
  warning: 'text-yellow-600',
  migrating: 'text-yellow-600',
  failed: 'text-red-600',
  dead: 'text-red-600',
  lost: 'text-red-600',
  unreachable: 'text-red-600',
  down: 'text-red-600',
  ineligible: 'text-gray-500',
  unknown: 'text-gray-500',
}

const ALLOC_STATUS_COLOR_MAP: Record<string, string> = {
  running: 'text-green-600',
  complete: 'text-blue-600',
  pending: 'text-yellow-600',
  failed: 'text-red-600',
  lost: 'text-red-600',
  unknown: 'text-gray-500',
}

export function statusColor(status: string): string {
  return STATUS_COLOR_MAP[status.toLowerCase()] ?? 'text-gray-500'
}

export function allocationStatusColor(status: string): string {
  return ALLOC_STATUS_COLOR_MAP[status.toLowerCase()] ?? 'text-gray-500'
}
