import { getLoanEndDate, getRemainingDuration } from '~/utils/account'

export const useAccountWidgets = (props: any) => {
  const chartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4']

  const monthlyStats = computed(() => {
    return props.filteredTransactions.reduce((acc: any, t: any) => {
      if (t.type === 'income') acc.income += t.amount
      else if (t.type === 'expense') acc.expense += Math.abs(t.amount)
      return acc
    }, { income: 0, expense: 0, get balance() { return this.income - this.expense } })
  })

  const categoryStats = computed(() => {
    const cats: Record<string, number> = {}
    props.filteredTransactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
      cats[t.category] = (cats[t.category] || 0) + Math.abs(t.amount)
    })
    
    const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1

    return Object.entries(cats)
      .sort(([,a], [,b]) => b - a)
      .map(([label, value], index) => ({ 
        label, 
        value, 
        percentage: (value / total) * 100,
        color: chartColors[index % chartColors.length] 
      }))
  })

  const conicGradientStyle = computed(() => {
    let currentAngle = 0
    const segments = categoryStats.value.map(cat => {
      const start = currentAngle
      const end = currentAngle + cat.percentage
      currentAngle = end
      return `${cat.color} ${start}% ${end}%`
    })
    if (segments.length === 0) return 'conic-gradient(#f1f5f9 0% 100%)'
    return `conic-gradient(${segments.join(', ')})`
  })

  const savingsProjection = computed(() => {
    if (props.account.account_group !== 'savings') return []
    
    const principal = props.account.current_balance
    const rate = (props.account.interest_rate || 0) / 100
    
    const periods = [1, 3, 5, 10]
    
    return periods.map(year => {
      const total = principal * Math.pow(1 + rate, year)
      const interest = total - principal
      return { year, total, interest }
    })
  })

  return { monthlyStats, categoryStats, conicGradientStyle, savingsProjection }
}