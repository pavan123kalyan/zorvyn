import { clamp } from './format.js'

export function sumBy(list, fn) {
  return list.reduce((acc, item) => acc + (Number(fn(item)) || 0), 0)
}

export function groupBy(list, keyFn) {
  /** @type {Record<string, any[]>} */
  const out = {}
  for (const item of list) {
    const k = String(keyFn(item))
    ;(out[k] ||= []).push(item)
  }
  return out
}

export function computeSummary(transactions) {
  const income = sumBy(
    transactions.filter((t) => t.type === 'income'),
    (t) => t.amount,
  )
  const expenses = sumBy(
    transactions.filter((t) => t.type === 'expense'),
    (t) => t.amount,
  )
  const balance = income - expenses
  return { income, expenses, balance }
}

export function computeSpendingByCategory(transactions) {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const grouped = groupBy(expenses, (t) => t.category || 'Uncategorized')
  const rows = Object.entries(grouped).map(([category, items]) => ({
    category,
    amount: sumBy(items, (t) => t.amount),
    count: items.length,
  }))
  rows.sort((a, b) => b.amount - a.amount)
  return rows
}

export function computeDailyBalanceSeries(transactions, { days = 30 } = {}) {
  const byDate = groupBy(transactions, (t) => t.date)
  const dates = Object.keys(byDate).sort() // asc
  if (dates.length === 0) return []

  const end = dates[dates.length - 1]
  const endDate = new Date(end + 'T00:00:00')
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (days - 1))

  const series = []
  let running = 0

  // Start with full historical balance before startDate
  for (const d of dates) {
    const dt = new Date(d + 'T00:00:00')
    if (dt < startDate) {
      const dayTx = byDate[d] || []
      for (const t of dayTx) {
        running += t.type === 'income' ? t.amount : -t.amount
      }
    }
  }
  
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    const dayTx = byDate[iso] || []
    for (const t of dayTx) {
      running += t.type === 'income' ? t.amount : -t.amount
    }
    series.push({ date: iso, balance: running })
  }

  return series
}

export function computeInsights(transactions) {
  const spending = computeSpendingByCategory(transactions)
  const topCategory = spending[0] || null

  // Monthly comparison: current month vs previous month expenses
  const byMonth = groupBy(
    transactions.filter((t) => t.type === 'expense'),
    (t) => (t.date ? t.date.slice(0, 7) : 'unknown'),
  )
  const months = Object.keys(byMonth).filter((m) => m !== 'unknown').sort()

  const currentMonth = months[months.length - 1]
  const prevMonth = months[months.length - 2]

  const currentSpend = currentMonth
    ? sumBy(byMonth[currentMonth] || [], (t) => t.amount)
    : 0
  const prevSpend = prevMonth ? sumBy(byMonth[prevMonth] || [], (t) => t.amount) : 0

  const change = prevSpend === 0 ? null : (currentSpend - prevSpend) / prevSpend

  // Income vs expenses ratio
  const { income, expenses } = computeSummary(transactions)
  const savingsRate = income <= 0 ? null : clamp((income - expenses) / income, -2, 2)

  return {
    topCategory,
    currentMonth,
    prevMonth,
    currentSpend,
    prevSpend,
    change,
    savingsRate,
  }
}

