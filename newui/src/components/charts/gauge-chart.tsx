import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface GaugeChartProps {
  value: number
  max: number
  label?: string
  color?: string
  size?: number
  className?: string
}

export function GaugeChart({
  value,
  max,
  label,
  color = '#3b82f6',
  size = 120,
  className,
}: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const pct = max > 0 ? Math.min(value / max, 1) : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(pct)
    }, 50)
    return () => clearTimeout(timer)
  }, [pct])

  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = -225
  const endAngle = 45
  const sweepAngle = endAngle - startAngle
  const currentAngle = startAngle + animatedValue * sweepAngle

  const polarToCartesian = (angle: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  })

  const arcPath = (start: number, end: number) => {
    const s = polarToCartesian(start)
    const e = polarToCartesian(end)
    const largeArc = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`
  }

  const backgroundPath = arcPath(startAngle, endAngle)
  const foregroundPath = animatedValue > 0 ? arcPath(startAngle, currentAngle) : ''

  const displayValue = Math.round(value)
  const displayMax = Math.round(max)

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={backgroundPath}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {foregroundPath && (
          <path
            d={foregroundPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-800 text-lg font-semibold"
          style={{ fontSize: size * 0.18 }}
        >
          {displayValue}
        </text>
        <text
          x={cx}
          y={cy + size * 0.12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-400"
          style={{ fontSize: size * 0.1 }}
        >
          / {displayMax}
        </text>
      </svg>
      {label && (
        <span className="text-xs text-gray-500">{label}</span>
      )}
    </div>
  )
}
