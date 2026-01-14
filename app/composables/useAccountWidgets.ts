import { getLoanEndDate, getRemainingDuration } from '~/utils/account'
import { CHART_COLORS, generateConicGradient } from '~/utils/chart'

export const useAccountWidgets = (props: any) => {
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
        color: CHART_COLORS[index % CHART_COLORS.length] || '#cccccc'
      }))
  })

  const conicGradientStyle = computed(() => {
    return generateConicGradient(categoryStats.value)
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