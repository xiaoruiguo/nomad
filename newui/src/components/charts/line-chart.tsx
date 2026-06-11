import { useState, useMemo } from 'react'
import { line as d3Line, curveMonotoneX } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import { cn } from '@/lib/utils'

interface DataPoint {
  x: number
  y: number
}

interface LineChartProps {
  data: DataPoint[]
  width: number
  height: number
  color?: string
  xLabel?: string
  yLabel?: string
  className?: string
}

export function LineChart({
  data,
  width,
  height,
  color = '#3b82f6',
  xLabel,
  yLabel,
  className,
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const margin = { top: 10, right: 20, bottom: 30, left: 45 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const { xScale, yScale, linePath, points } = useMemo(() => {
    if (data.length === 0) {
      return {
        xScale: scaleLinear().domain([0, 1]).range([0, innerWidth]),
        yScale: scaleLinear().domain([0, 1]).range([innerHeight, 0]),
        linePath: '',
        points: [] as { cx: number; cy: number; datum: DataPoint }[],
      }
    }

    const xExtent = [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))]
    const yExtent = [Math.min(...data.map((d) => d.y)), Math.max(...data.map((d) => d.y))]

    const xScale = scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth])
      .nice()

    const yScale = scaleLinear()
      .domain(yExtent)
      .range([innerHeight, 0])
      .nice()

    const lineGen = d3Line<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(curveMonotoneX)

    const linePath = lineGen(data) ?? ''

    const points = data.map((d) => ({
      cx: xScale(d.x),
      cy: yScale(d.y),
      datum: d,
    }))

    return { xScale, yScale, linePath, points }
  }, [data, innerWidth, innerHeight])

  const xTicks = xScale.ticks(6)
  const yTicks = yScale.ticks(5)

  const hovered = hoveredIndex !== null ? points[hoveredIndex] : null

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={-8}
                y={yScale(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-gray-400"
                style={{ fontSize: 10 }}
              >
                {formatTickValue(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={xScale(tick)}
                y={innerHeight + 16}
                textAnchor="middle"
                className="fill-gray-400"
                style={{ fontSize: 10 }}
              >
                {formatTickValue(tick)}
              </text>
            </g>
          ))}

          <line
            x1={0}
            x2={innerWidth}
            y1={innerHeight}
            y2={innerHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
          <line
            x1={0}
            x2={0}
            y1={0}
            y2={innerHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
          />

          {data.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          )}

          <path
            d={`${linePath}L ${xScale(data[data.length - 1]?.x ?? 0)},${innerHeight} L ${xScale(data[0]?.x ?? 0)},${innerHeight} Z`}
            fill={color}
            opacity={0.08}
          />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={hoveredIndex === i ? 5 : 3}
              fill={hoveredIndex === i ? color : '#fff'}
              stroke={color}
              strokeWidth={2}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </g>

        {xLabel && (
          <text
            x={width / 2}
            y={height - 2}
            textAnchor="middle"
            className="fill-gray-500"
            style={{ fontSize: 11 }}
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={12}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(-90, 12, ${height / 2})`}
            className="fill-gray-500"
            style={{ fontSize: 11 }}
          >
            {yLabel}
          </text>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: margin.left + hovered.cx + 10,
            top: margin.top + hovered.cy - 30,
          }}
        >
          <div className="font-medium text-gray-800">
            {xLabel ?? 'X'}: {formatTickValue(hovered.datum.x)}
          </div>
          <div className="text-gray-500">
            {yLabel ?? 'Y'}: {formatTickValue(hovered.datum.y)}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTickValue(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  if (Number.isInteger(v)) return String(v)
  return v.toFixed(2)
}
