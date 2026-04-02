import React, { useEffect, useMemo, useState } from 'react'
import { useDashboard } from '../state/DashboardStore.jsx'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function makeId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function TransactionModal({ open, mode, initial, onClose }) {
  const { state, addTransaction, updateTransaction } = useDashboard()
  const isAdmin = state.role === 'admin'

  const defaults = useMemo(() => {
    const base = {
      id: makeId(),
      date: todayISO(),
      description: '',
      category: '',
      type: 'expense',
      amount: '',
    }
    if (!initial) return base
    return { ...base, ...initial, amount: String(initial.amount ?? '') }
  }, [initial])

  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(defaults)
    setError('')
  }, [defaults, open])

  if (!open) return null

  const title = mode === 'edit' ? 'Edit transaction' : 'Add transaction'

  function patch(p) {
    setForm((s) => ({ ...s, ...p }))
  }

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!isAdmin) {
      setError('Viewer role is read-only. Switch to Admin to make changes.')
      return
    }

    const amount = Number(form.amount)
    if (!form.date) return setError('Please select a date.')
    if (!Number.isFinite(amount) || amount <= 0) return setError('Amount must be a positive number.')

    const payload = {
      ...form,
      amount,
      description: String(form.description || '').trim(),
      category: String(form.category || '').trim(),
      type: form.type === 'income' ? 'income' : 'expense',
    }

    if (mode === 'edit') updateTransaction(payload)
    else addTransaction(payload)
    onClose?.()
  }

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cardHeader">
          <p className="cardTitle">{title}</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge">{isAdmin ? 'Admin' : 'Viewer'}</span>
            <button className="btn" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="modalGrid">
            <div className="col6">
              <div className="helper">Date</div>
              <div className="field">
                <input type="date" value={form.date} onChange={(e) => patch({ date: e.target.value })} />
              </div>
            </div>
            <div className="col6">
              <div className="helper">Type</div>
              <div className="field">
                <select value={form.type} onChange={(e) => patch({ type: e.target.value })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div className="col12">
              <div className="helper">Description</div>
              <div className="field">
                <input
                  placeholder="e.g., Groceries / Salary / Rent"
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
            </div>

            <div className="col6">
              <div className="helper">Category</div>
              <div className="field">
                <input
                  placeholder="e.g., Food / Salary / Housing"
                  value={form.category}
                  onChange={(e) => patch({ category: e.target.value })}
                />
              </div>
            </div>
            <div className="col6">
              <div className="helper">Amount</div>
              <div className="field">
                <input
                  inputMode="decimal"
                  placeholder="e.g., 45.90"
                  value={form.amount}
                  onChange={(e) => patch({ amount: e.target.value })}
                />
              </div>
            </div>
          </div>

          {error ? <div style={{ marginTop: 10 }} className="pill pillExpense">{error}</div> : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btnPrimary" type="submit" disabled={!isAdmin}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

