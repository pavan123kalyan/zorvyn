import React, { useMemo, useState } from 'react'
import { useDashboard } from './state/DashboardStore.jsx'
import { TopBar } from './components/TopBar.jsx'
import { SummaryCards } from './components/SummaryCards.jsx'
import { TransactionsTable } from './components/TransactionsTable.jsx'
import { TransactionModal } from './components/TransactionModal.jsx'
import { Insights } from './components/Insights.jsx'
import { computeDailyBalanceSeries, computeSpendingByCategory } from './utils/analytics.js'
import { LineChart } from './components/charts/LineChart.jsx'
import { DonutChart } from './components/charts/DonutChart.jsx'

export default function Dashboard() {
  const { state } = useDashboard()
  const [modal, setModal] = useState({ open: false, mode: 'add', initial: null })

  const chartSeries = useMemo(
    () => computeDailyBalanceSeries(state.transactions, { days: 30 }),
    [state.transactions],
  )
  const spending = useMemo(
    () => computeSpendingByCategory(state.transactions),
    [state.transactions],
  )

  return (
    <div className="app">
      <TopBar
        onAdd={() => setModal({ open: true, mode: 'add', initial: null })}
      />

      <div className="sectionTitle">Overview</div>
      <SummaryCards transactions={state.transactions} currency={state.currency} />

      <div style={{ height: 14 }} />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <div className="cardHeader">
            <p className="cardTitle">Balance trend</p>
            <span className="badge">Last 30 days</span>
          </div>
          <div className="chartWrap">
            <LineChart data={chartSeries} />
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 5' }}>
          <div className="cardHeader">
            <p className="cardTitle">Spending breakdown</p>
            <span className="badge">By category</span>
          </div>
          <DonutChart data={spending} currency={state.currency} centerLabel="Expenses" />
        </div>
      </div>

      <div className="sectionTitle">Transactions</div>
      <TransactionsTable
        onEdit={(t) => setModal({ open: true, mode: 'edit', initial: t })}
      />

      <div className="sectionTitle">Insights</div>
      <Insights transactions={state.transactions} currency={state.currency} />

      <TransactionModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.initial}
        onClose={() => setModal({ open: false, mode: 'add', initial: null })}
      />
    </div>
  )
}

