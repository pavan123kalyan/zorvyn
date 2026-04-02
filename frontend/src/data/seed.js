function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function round2(n) {
  return Math.round(n * 100) / 100
}

const EXPENSE_CATEGORIES = [
  'Housing',
  'Food',
  'Transport',
  'Shopping',
  'Health',
  'Entertainment',
  'Subscriptions',
  'Utilities',
]

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Interest', 'Refund']

const DESCRIPTIONS = {
  Housing: ['Rent', 'Home repair', 'Furniture', 'Property maintenance'],
  Food: ['Groceries', 'Coffee', 'Restaurant', 'Food delivery'],
  Transport: ['Fuel', 'Ride share', 'Public transit', 'Parking'],
  Shopping: ['Online order', 'Clothing', 'Gadgets', 'Household items'],
  Health: ['Pharmacy', 'Clinic', 'Gym', 'Wellness'],
  Entertainment: ['Movies', 'Games', 'Events', 'Streaming'],
  Subscriptions: ['Music subscription', 'Cloud storage', 'Software plan'],
  Utilities: ['Electricity', 'Internet', 'Water', 'Mobile plan'],
  Salary: ['Monthly salary'],
  Freelance: ['Client invoice', 'Consulting'],
  Interest: ['Savings interest', 'Investment dividend'],
  Refund: ['Merchant refund'],
}

function makeId(prefix, n) {
  return `${prefix}_${n}`
}

export function createSeedTransactions({ days = 90, seed = 42 } = {}) {
  const rng = mulberry32(seed)
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - days + 1)

  /** @type {Array<{id:string,date:string,description:string,category:string,type:'income'|'expense',amount:number}>} */
  const tx = []
  let id = 1

  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = toISODate(d)

    // Salary on 1st of month
    if (d.getDate() === 1) {
      const amount = round2(3200 + rng() * 400)
      tx.push({
        id: makeId('t', id++),
        date: iso,
        description: pick(rng, DESCRIPTIONS.Salary),
        category: 'Salary',
        type: 'income',
        amount,
      })
    }

    // 0-3 expenses/day
    const expenseCount = Math.floor(rng() * 4)
    for (let j = 0; j < expenseCount; j++) {
      const category = pick(rng, EXPENSE_CATEGORIES)
      const base =
        category === 'Housing'
          ? 55
          : category === 'Utilities'
            ? 18
            : category === 'Health'
              ? 22
              : category === 'Transport'
                ? 16
                : 12

      const multiplier =
        category === 'Housing' ? 10 : category === 'Shopping' ? 6 : 4
      const amount = round2(base + rng() * base * multiplier)

      tx.push({
        id: makeId('t', id++),
        date: iso,
        description: pick(rng, DESCRIPTIONS[category]),
        category,
        type: 'expense',
        amount,
      })
    }

    // occasional income/refund
    if (rng() < 0.12) {
      const category = pick(rng, INCOME_CATEGORIES)
      const amount =
        category === 'Freelance'
          ? round2(250 + rng() * 900)
          : category === 'Refund'
            ? round2(10 + rng() * 110)
            : round2(5 + rng() * 45)
      tx.push({
        id: makeId('t', id++),
        date: iso,
        description: pick(rng, DESCRIPTIONS[category]),
        category,
        type: 'income',
        amount,
      })
    }
  }

  // Sort descending by date for UI
  tx.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return tx
}

