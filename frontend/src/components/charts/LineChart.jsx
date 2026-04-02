import React, { useMemo } from 'react'
import { clamp } from '../../utils/format.js'

function niceTicks(min, max, count = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return []
  if (min === max) return [min]
  const span = max - min
  const step = span / count
  const ticks = []
  for (let i = 0; i <= count; i++) ticks.push(min + step * i)
  return ticks
}

export function LineChart({
  data,
  width = 680,
  height = 220,
  stroke = 'var(--info)',
  fill = 'rgba(56,189,248,0.16)',
  label = 'Balance',
}) {
  const { path, areaPath, min, max, ticks } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', min: 0, max: 0, ticks: [] }
    }

    const values = data.map((d) => Number(d.balance || 0))
    const mn = Math.min(...values)
    const mx = Math.max(...values)
    const pad = (mx - mn) * 0.12 || 1
    const minY = mn - pad
    const maxY = mx + pad

    const left = 44
    const right = 12
    const top = 10
    const bottom = 22

    const innerW = width - left - right
    const innerH = height - top - bottom

    const xAt = (i) => left + (innerW * i) / (data.length - 1)
    const yAt = (v) => top + innerH * (1 - (v - minY) / (maxY - minY))

    let d = ''
    for (let i = 0; i < data.length; i++) {
      const x = xAt(i)
      const y = yAt(values[i])
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `
    }

    const area =
      `M ${xAt(0).toFixed(2)} ${yAt(values[0]).toFixed(2)} ` +
      d.replace(/^M [\d.]+ [\d.]+ /, '') +
      `L ${xAt(data.length - 1).toFixed(2)} ${(top + innerH).toFixed(2)} ` +
      `L ${xAt(0).toFixed(2)} ${(top + innerH).toFixed(2)} Z`

    return { path: d.trim(), areaPath: area.trim(), min: minY, max: maxY, ticks: niceTicks(minY, maxY, 4) }
  }, [data, height, width])

  if (!data || data.length === 0) {
    return (
      <div className="muted" style={{ padding: 14 }}>
        No data yet.
      </div>
    )
  }

  const left = 44
  const right = 12
  const top = 10
  const bottom = 22
  const innerW = width - left - right
  const innerH = height - top - bottom

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={label}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </linearGradient>
      </defs>

      {/* grid + axis */}
      {ticks.map((t) => {
        const y = top + innerH * (1 - (t - min) / (max - min))
        return (
          <g key={t}>
            <line x1={left} x2={left + innerW} y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 6" />
            <text x={left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--mono)">
              {Math.round(t)}
            </text>
          </g>
        )
      })}

      {/* area + line */}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.2" />

      {/* last point */}
      {(() => {
        const last = data[data.length - 1]
        const values = data.map((d) => Number(d.balance || 0))
        const mn = Math.min(...values)
        const mx = Math.max(...values)
        const pad = (mx - mn) * 0.12 || 1
        const minY = mn - pad
        const maxY = mx + pad
        const x = left + innerW
        const v = Number(last.balance || 0)
        const y = top + innerH * (1 - (v - minY) / (maxY - minY))
        const cy = clamp(y, top, top + innerH)
        return (
          <g>
            <circle cx={x} cy={cy} r="4.6" fill="var(--bg)" stroke={stroke} strokeWidth="2" />
          </g>
        )
      })()}

      {/* x labels (first/last) */}
      <text x={left} y={height - 6} textAnchor="start" fontSize="11" fill="var(--muted)" fontFamily="var(--mono)">
        {String(data[0]?.date || '').slice(5)}
      </text>
      <text x={left + innerW} y={height - 6} textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--mono)">
        {String(data[data.length - 1]?.date || '').slice(5)}
      </text>
    </svg>
  )
}

