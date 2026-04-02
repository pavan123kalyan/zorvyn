import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { createSeedTransactions } from '../data/seed.js'

const STORAGE_KEY = 'financeDashboard.v1'

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function defaultState() {
  return {
    role: 'viewer', // 'viewer' | 'admin'
    theme: 'system', // 'system' | 'dark' | 'light'
    currency: 'USD',
    transactions: createSeedTransactions({ days: 90, seed: 42 }),
    filters: {
      query: '',
      type: 'all', // all | income | expense
      category: 'all',
      from: '',
      to: '',
      sortBy: 'date', // date | amount | category
      sortDir: 'desc', // asc | desc
    },
  }
}

function loadState() {
  if (typeof window === 'undefined') return defaultState()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (!parsed || typeof parsed !== 'object') return defaultState()
  const base = defaultState()
  return {
    ...base,
    ...parsed,
    filters: { ...base.filters, ...(parsed.filters || {}) },
  }
}

function persistState(state) {
  if (typeof window === 'undefined') return
  const payload = {
    role: state.role,
    theme: state.theme,
    currency: state.currency,
    transactions: state.transactions,
    filters: state.filters,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function normalizeTransaction(input) {
  const amount = Number(input.amount || 0)
  return {
    id: String(input.id),
    date: String(input.date).slice(0, 10),
    description: String(input.description || '').trim() || 'Transaction',
    category: String(input.category || '').trim() || 'Uncategorized',
    type: input.type === 'income' ? 'income' : 'expense',
    amount: Math.abs(amount),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.role }
    case 'setTheme':
      return { ...state, theme: action.theme }
    case 'setCurrency':
      return { ...state, currency: action.currency }
    case 'setFilters':
      return { ...state, filters: { ...state.filters, ...action.patch } }
    case 'addTransaction': {
      const t = normalizeTransaction(action.transaction)
      return { ...state, transactions: [t, ...state.transactions] }
    }
    case 'updateTransaction': {
      const t = normalizeTransaction(action.transaction)
      return {
        ...state,
        transactions: state.transactions.map((x) => (x.id === t.id ? t : x)),
      }
    }
    case 'deleteTransaction':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.id),
      }
    case 'resetData':
      return defaultState()
    case 'setTransactions':
      return { ...state, transactions: action.transactions || [] }
    default:
      return state
  }
}

const StoreContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  const systemDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  let resolved = theme
  if (theme === 'system') resolved = systemDark ? 'dark' : 'light'

  if (resolved === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')
}

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    persistState(state)
  }, [state])

  useEffect(() => {
    applyTheme(state.theme)
    if (state.theme !== 'system') return
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const handler = () => applyTheme('system')
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [state.theme])

  const api = useMemo(() => {
    return {
      state,
      setRole: (role) => dispatch({ type: 'setRole', role }),
      setTheme: (theme) => dispatch({ type: 'setTheme', theme }),
      setCurrency: (currency) => dispatch({ type: 'setCurrency', currency }),
      setFilters: (patch) => dispatch({ type: 'setFilters', patch }),
      addTransaction: (transaction) => dispatch({ type: 'addTransaction', transaction }),
      updateTransaction: (transaction) =>
        dispatch({ type: 'updateTransaction', transaction }),
      deleteTransaction: (id) => dispatch({ type: 'deleteTransaction', id }),
      resetData: () => dispatch({ type: 'resetData' }),
      setTransactions: (transactions) =>
        dispatch({ type: 'setTransactions', transactions }),
    }
  }, [state])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}

