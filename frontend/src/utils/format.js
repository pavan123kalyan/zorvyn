export function formatMoney(amount, currency = 'USD') {
  const value = Number(amount || 0)
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

export function formatCompactMoney(amount, currency = 'USD') {
  const value = Number(amount || 0)
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function toISODateInput(value) {
  if (!value) return ''
  // expects yyyy-mm-dd already; if Date object passed, normalize
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return String(value).slice(0, 10)
}

