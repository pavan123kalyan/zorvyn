import React, { useMemo } from 'react'
import { computeInsights } from '../utils/analytics.js'
import { formatMoney } from '../utils/format.js'

function pct(x) {
  if (x === null || x === undefined || !Number.isFinite(x)) return '—'
  const sign = x > 0 ? '+' : ''
  return `${sign}${Math.round(x * 100)}%`
}

export function Insights({ transactions, currency }) {
  const insights = useMemo(() => computeInsights(transactions), [transactions])

  const top = insights.topCategory
  const changeTone =
    insights.change === null ? 'neutral' : insights.change > 0 ? 'warn' : 'good'

  const savingsTone =
    insights.savingsRate === null
      ? 'neutral'
      : insights.savingsRate >= 0.2
        ? 'good'
        : insights.savingsRate >= 0
          ? 'neutral'
          : 'bad'

  return (
    <div className="card">
      <div className="cardHeader">
        <p className="cardTitle">Insights</p>
        <span className="badge">Auto-generated</span>
      </div>

      {transactions.length === 0 ? (
        <div className="muted" style={{ padding: 6 }}>
          Add transactions to see insights.
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <div style={{ gridColumn: 'span 4' }}>
            <div className="helper">Highest spending category</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontWeight: 650 }}>{top ? top.category : '—'}</span>
              <span className="muted" style={{ fontFamily: 'var(--mono)' }}>
                {top ? formatMoney(top.amount, currency) : '—'}
              </span>
            </div>
            <div className="faint" style={{ marginTop: 6 }}>
              Based on expense transactions only.
            </div>
          </div>

          <div style={{ gridColumn: 'span 4' }}>
            <div className="helper">Monthly comparison (expenses)</div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span className="muted">{insights.currentMonth || '—'}</span>
              <span style={{ fontFamily: 'var(--mono)' }}>
                {formatMoney(insights.currentSpend, currency)}
              </span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span className="muted">{insights.prevMonth || '—'}</span>
              <span className="muted" style={{ fontFamily: 'var(--mono)' }}>
                {formatMoney(insights.prevSpend, currency)}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                className={`pill ${
                  changeTone === 'warn'
                    ? 'pillExpense'
                    : changeTone === 'good'
                      ? 'pillIncome'
                      : ''
                }`}
              >
                MoM change: {pct(insights.change)}
              </span>
            </div>
          </div>

          <div style={{ gridColumn: 'span 4' }}>
            <div className="helper">Estimated savings rate</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontWeight: 650 }}>
                {insights.savingsRate === null ? '—' : pct(insights.savingsRate)}
              </span>
              <span className="muted">(\((income - expenses) / income\))</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                className={`pill ${
                  savingsTone === 'bad'
                    ? 'pillExpense'
                    : savingsTone === 'good'
                      ? 'pillIncome'
                      : ''
                }`}
              >
                {savingsTone === 'good'
                  ? 'Healthy buffer'
                  : savingsTone === 'bad'
                    ? 'Overspending'
                    : 'Neutral'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

