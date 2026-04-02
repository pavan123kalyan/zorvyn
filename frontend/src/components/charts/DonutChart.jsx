import React, { useMemo } from 'react'
import { clamp, formatCompactMoney } from '../../utils/format.js'

function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function arcPath(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const startOuter = polar(cx, cy, rOuter, endDeg)
  const endOuter = polar(cx, cy, rOuter, startDeg)
  const startInner = polar(cx, cy, rInner, startDeg)
  const endInner = polar(cx, cy, rInner, endDeg)
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1

  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

const PALETTE = [
  'rgba(124,58,237,0.95)',
  'rgba(34,197,94,0.9)',
  'rgba(56,189,248,0.9)',
  'rgba(245,158,11,0.9)',
  'rgba(239,68,68,0.9)',
  'rgba(236,72,153,0.9)',
  'rgba(168,85,247,0.85)',
  'rgba(14,165,233,0.85)',
]

export function DonutChart({
  data,
  width = 420,
  height = 240,
  centerLabel = 'Spend',
  currency = 'USD',
}) {
  const { slices, total } = useMemo(() => {
    const rows = (data || []).filter((d) => Number(d.amount) > 0)
    const tot = rows.reduce((a, r) => a + Number(r.amount), 0)
    const top = rows.slice(0, 6)
    const rest = rows.slice(6)
    const restAmount = rest.reduce((a, r) => a + Number(r.amount), 0)
    const merged = restAmount > 0 ? [...top, { category: 'Other', amount: restAmount }] : top
    return { slices: merged, total: tot }
  }, [data])

  if (!slices || slices.length === 0) {
    return (
      <div className="muted" style={{ padding: 14 }}>
        No spending to show.
      </div>
    )
  }

  const cx = 120
  const cy = height / 2
  const rOuter = 82
  const rInner = 54
  const start = 0
  const gap = 1.2

  let angle = start
  const arcs = slices.map((s, i) => {
    const frac = total <= 0 ? 0 : Number(s.amount) / total
    const sweep = clamp(frac * 360, 0, 360)
    const a0 = angle + gap / 2
    const a1 = angle + sweep - gap / 2
    angle += sweep
    return {
      ...s,
      color: PALETTE[i % PALETTE.length],
      d: sweep <= gap ? '' : arcPath(cx, cy, rOuter, rInner, a0, a1),
    }
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14, alignItems: 'center' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Spending breakdown">
        <g>
          {arcs.map((a) =>
            a.d ? (
              <path key={a.category} d={a.d} fill={a.color} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            ) : null,
          )}
          <circle cx={cx} cy={cy} r={rInner - 6} fill="color-mix(in oklab, var(--surface) 85%, transparent)" stroke="var(--border)" />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--mono)">
            {centerLabel}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="16" fill="var(--text)" fontWeight="700">
            {formatCompactMoney(total, currency)}
          </text>
        </g>
      </svg>

      <div style={{ minWidth: 0 }}>
        {arcs.map((a) => (
          <div key={a.category} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: a.color,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
                  flex: '0 0 auto',
                }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.category}</span>
            </div>
            <span className="muted" style={{ fontFamily: 'var(--mono)' }}>
              {formatCompactMoney(a.amount, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

