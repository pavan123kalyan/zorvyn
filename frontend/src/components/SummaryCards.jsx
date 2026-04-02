import React, { useMemo } from 'react'
import { computeSummary } from '../utils/analytics.js'
import { formatMoney, formatCompactMoney } from '../utils/format.js'

function Card({ title, value, sub, tone }) {
  const style =
    tone === 'income'
      ? { borderColor: 'color-mix(in oklab, var(--brand-2) 45%, var(--border) 55%)' }
      : tone === 'expense'
        ? { borderColor: 'color-mix(in oklab, var(--danger) 45%, var(--border) 55%)' }
        : tone === 'balance'
          ? { borderColor: 'color-mix(in oklab, var(--info) 35%, var(--border) 65%)' }
          : undefined

  return (
    <div className="card" style={style}>
      <div className="cardHeader">
        <p className="cardTitle">{title}</p>
        <span className="badge">{sub}</span>
      </div>
      <div className="kpi">
        <div>
          <div className="kpiValue">{value}</div>
          <div className="kpiSub">Last 90 days (mock)</div>
        </div>
      </div>
    </div>
  )
}

export function SummaryCards({ transactions, currency }) {
  const summary = useMemo(() => computeSummary(transactions), [transactions])

  return (
    <div className="grid gridCards">
      <div style={{ gridColumn: 'span 4' }}>
        <Card title="Total Balance" value={formatMoney(summary.balance, currency)} sub="Net" tone="balance" />
      </div>
      <div style={{ gridColumn: 'span 4' }}>
        <Card title="Income" value={formatCompactMoney(summary.income, currency)} sub="In" tone="income" />
      </div>
      <div style={{ gridColumn: 'span 4' }}>
        <Card title="Expenses" value={formatCompactMoney(summary.expenses, currency)} sub="Out" tone="expense" />
      </div>
    </div>
  )
}

