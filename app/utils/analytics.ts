export type TimeRange = 'week' | 'month' | 'year'
export type AnalyticsType = 'users' | 'premium' | 'transactions'

export const getDateRange = (currentDate: Date, range: TimeRange) => {
  const start = new Date(currentDate)
  const end = new Date(currentDate)

  if (range === 'week') {
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
    start.setHours(0, 0, 0, 0)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  } else if (range === 'month') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    end.setHours(23, 59, 59, 999)
  } else { // year
    start.setMonth(0, 1)
    start.setHours(0, 0, 0, 0)
    end.setMonth(11, 31)
    end.setHours(23, 59, 59, 999)
  }
  return { start, end }
}

export const generateBuckets = (start: Date, end: Date, range: TimeRange) => {
  const buckets: Record<string, number> = {}
  const labels: string[] = []

  if (range === 'week') {
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const key = d.toLocaleDateString('fr-FR', { weekday: 'short' })
      buckets[key] = 0
      labels.push(key)
    }
  } else if (range === 'month') {
    const daysInMonth = end.getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const key = i.toString()
      buckets[key] = 0
      labels.push(key)
    }
  } else { // year
    for (let i = 0; i < 12; i++) {
      const d = new Date(start)
      d.setMonth(i)
      const key = d.toLocaleDateString('fr-FR', { month: 'short' })
      buckets[key] = 0
      labels.push(key)
    }
  }
  return { buckets, labels }
}

export const processChartData = (records: any[], range: TimeRange, type: AnalyticsType, start: Date, end: Date) => {
  const { buckets, labels } = generateBuckets(start, end, range)

  records.forEach(r => {
    const d = new Date(r.created)
    let key = ''
    if (range === 'week') key = d.toLocaleDateString('fr-FR', { weekday: 'short' })
    else if (range === 'month') key = d.getDate().toString()
    else key = d.toLocaleDateString('fr-FR', { month: 'short' })

    if (buckets[key] !== undefined) {
      if (type === 'transactions') buckets[key] = (buckets[key] as number) + Math.abs(r.amount || 0)
      else buckets[key] = (buckets[key] as number) + 1
    }
  })

  return labels.map(l => ({ label: l, value: Math.round((buckets[l] || 0) * 100) / 100 }))
}

export const calculateStats = (records: any[], type: AnalyticsType) => {
  if (type === 'users') {
    return { total: records.length, label: 'Inscriptions' }
  } else if (type === 'premium') {
    const revenue = records.length * 9.99
    return { total: records.length, label: 'Nouveaux Premium', revenue: `${revenue.toFixed(2)}€` }
  } else {
    let income = 0
    let expense = 0
    records.forEach(r => {
      const val = Math.abs(r.amount || 0)
      if (r.type === 'income') income += val
      else expense += val
    })
    const balance = income - expense
    return { 
      income: `${income.toFixed(2)}€`, 
      expense: `${expense.toFixed(2)}€`, 
      balance: `${balance > 0 ? '+' : ''}${balance.toFixed(2)}€` 
    }
  }
}