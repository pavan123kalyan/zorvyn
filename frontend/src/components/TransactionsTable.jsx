import React, { useMemo } from 'react'
import { useDashboard } from '../state/DashboardStore.jsx'
import { formatMoney } from '../utils/format.js'

function uniqueCategories(transactions) {
  const set = new Set()
  for (const t of transactions) set.add(t.category || 'Uncategorized')
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

export function TransactionsTable({ onEdit }) {
  const { state, setFilters, deleteTransaction } = useDashboard()
  const isAdmin = state.role === 'admin'

  const categories = useMemo(
    () => uniqueCategories(state.transactions),
    [state.transactions],
  )

  const filtered = useMemo(() => {
    const f = state.filters
    const q = f.query.trim().toLowerCase()
    const from = f.from ? new Date(f.from + 'T00:00:00') : null
    const to = f.to ? new Date(f.to + 'T23:59:59') : null

    let list = state.transactions

    if (f.type !== 'all') list = list.filter((t) => t.type === f.type)
    if (f.category !== 'all')
      list = list.filter((t) => (t.category || 'Uncategorized') === f.category)

    if (from) list = list.filter((t) => new Date(t.date + 'T00:00:00') >= from)
    if (to) list = list.filter((t) => new Date(t.date + 'T00:00:00') <= to)

    if (q) {
      list = list.filter((t) => {
        const hay = `${t.description} ${t.category} ${t.type} ${t.amount} ${t.date}`.toLowerCase()
        return hay.includes(q)
      })
    }

    const dir = f.sortDir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      if (f.sortBy === 'amount') return dir * (Number(a.amount) - Number(b.amount))
      if (f.sortBy === 'category') return dir * compare(a.category || '', b.category || '')
      return dir * compare(a.date, b.date)
    })

    return list
  }, [state.transactions, state.filters])

  const empty = state.transactions.length === 0
  const noMatches = !empty && filtered.length === 0

  return (
    <div className="card">
      <div className="cardHeader">
        <p className="cardTitle">Transactions</p>
        <span className="badge">{filtered.length} shown</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'end' }}>
        <div style={{ gridColumn: 'span 4' }}>
          <div className="helper">Search</div>
          <div className="field">
            <input
              placeholder="Search by text, category, date, amount…"
              value={state.filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
            />
          </div>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <div className="helper">Type</div>
          <div className="field">
            <select value={state.filters.type} onChange={(e) => setFilters({ type: e.target.value })}>
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <div style={{ gridColumn: 'span 3' }}>
          <div className="helper">Category</div>
          <div className="field">
            <select value={state.filters.category} onChange={(e) => setFilters({ category: e.target.value })}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ gridColumn: 'span 3', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="helper">From</div>
            <div className="field">
              <input type="date" value={state.filters.from} onChange={(e) => setFilters({ from: e.target.value })} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="helper">To</div>
            <div className="field">
              <input type="date" value={state.filters.to} onChange={(e) => setFilters({ to: e.target.value })} />
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 3' }}>
          <div className="helper">Sort</div>
          <div className="field">
            <select
              value={`${state.filters.sortBy}:${state.filters.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split(':')
                setFilters({ sortBy, sortDir })
              }}
            >
              <option value="date:desc">Date (newest)</option>
              <option value="date:asc">Date (oldest)</option>
              <option value="amount:desc">Amount (high → low)</option>
              <option value="amount:asc">Amount (low → high)</option>
              <option value="category:asc">Category (A → Z)</option>
              <option value="category:desc">Category (Z → A)</option>
            </select>
          </div>
        </div>

        <div style={{ gridColumn: 'span 9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            className="btn"
            onClick={() =>
              setFilters({
                query: '',
                type: 'all',
                category: 'all',
                from: '',
                to: '',
                sortBy: 'date',
                sortDir: 'desc',
              })
            }
          >
            Clear filters
          </button>
        </div>
      </div>

      <div style={{ height: 12 }} />

      {empty ? (
        <div className="muted" style={{ padding: 12 }}>
          No transactions yet. Switch to <b>Admin</b> to add your first transaction.
        </div>
      ) : null}

      {noMatches ? (
        <div className="muted" style={{ padding: 12 }}>
          No results match your current filters.
        </div>
      ) : null}

      {!empty && filtered.length > 0 ? (
        <div className="tableWrap" role="region" aria-label="Transactions table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--mono)' }}>{t.date}</td>
                  <td style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</td>
                  <td>{t.category || 'Uncategorized'}</td>
                  <td>
                    <span className={`pill ${t.type === 'income' ? 'pillIncome' : 'pillExpense'}`}>
                      {t.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>
                    <span className={t.type === 'income' ? 'amountIncome' : 'amountExpense'}>
                      {t.type === 'income' ? '+' : '-'}
                      {formatMoney(t.amount, state.currency)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        className="btn"
                        disabled={!isAdmin}
                        title={isAdmin ? 'Edit transaction' : 'Switch to Admin to edit'}
                        onClick={() => onEdit?.(t)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btnDanger"
                        disabled={!isAdmin}
                        title={isAdmin ? 'Delete transaction' : 'Switch to Admin to delete'}
                        onClick={() => {
                          if (confirm('Delete this transaction?')) deleteTransaction(t.id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

