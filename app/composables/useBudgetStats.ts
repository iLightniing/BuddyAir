export const useBudgetStats = (
  budgets: Ref<any[]>,
  transactions: Ref<any[]>,
  previousTransactions: Ref<any[]>,
  scheduledTransactions: Ref<any[]>,
  incomeTransactions: Ref<any[]>,
  currentDate: Ref<Date>,
  categories: Ref<any[]>,
  sortBy: Ref<string>
) => {
  // --- Helpers ---
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 85) return 'bg-orange-500'
    return 'bg-emerald-500'
  }

  const getPaceStatus = (percentage: number) => {
    const now = new Date()
    if (currentDate.value.getMonth() !== now.getMonth() || currentDate.value.getFullYear() !== now.getFullYear()) return null
    
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const monthProgress = (now.getDate() / daysInMonth) * 100
    
    if (percentage > monthProgress + 15) return { label: 'Rythme élevé', class: 'text-red-500 bg-red-50 border-red-100' }
    if (percentage < monthProgress - 10) return { label: 'Économe', class: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
    return { label: 'Dans les temps', class: 'text-blue-600 bg-blue-50 border-blue-100' }
  }

  // --- Computed Stats ---
  const budgetStats = computed(() => {
    const now = new Date()
    const isCurrent = currentDate.value.getMonth() === now.getMonth() && currentDate.value.getFullYear() === now.getFullYear()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1)

    const stats = budgets.value.map(b => {
      const categoryTransactions = transactions.value.filter(t => t.category === b.category)
      const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      const prevCategoryTransactions = previousTransactions.value.filter(t => t.category === b.category)
      const prevSpent = prevCategoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const categoryScheduled = scheduledTransactions.value.filter(t => t.category === b.category)
      const scheduled = categoryScheduled.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      const catDef = categories.value.find(c => c.name === b.category)
      const icon = catDef?.icon || 'lucide:wallet'
      
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0
      const remaining = b.amount - spent
      
      return {
        ...b,
        spent,
        remaining,
        remainingPerDay: (isCurrent && remaining > 0) ? remaining / remainingDays : 0,
        percentage,
        scheduled,
        projectedPercentage: b.amount > 0 ? ((spent + scheduled) / b.amount) * 100 : 0,
        prevSpent,
        trend: spent - prevSpent,
        transactionCount: categoryTransactions.length,
        icon,
        pace: getPaceStatus(percentage),
        progressColor: getProgressColor(percentage)
      }
    })

    return stats.sort((a, b) => {
      if (sortBy.value === 'progress-desc') return b.percentage - a.percentage
      if (sortBy.value === 'spent-desc') return b.spent - a.spent
      if (sortBy.value === 'amount-desc') return b.amount - a.amount
      if (sortBy.value === 'category') return a.category.localeCompare(b.category)
      return 0
    })
  })

  const globalStats = computed(() => {
    const totalLimit = budgetStats.value.reduce((acc, b) => acc + b.amount, 0)
    const totalSpent = budgetStats.value.reduce((acc, b) => acc + b.spent, 0)
    const totalRemaining = totalLimit - totalSpent
    const progress = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
    const totalScheduled = budgetStats.value.reduce((acc, b) => acc + b.scheduled, 0)
    const totalIncome = incomeTransactions.value.reduce((acc, t) => acc + Math.abs(t.amount), 0)
    const savingsCapacity = totalIncome - totalLimit
    const savingsRate = totalIncome > 0 ? (savingsCapacity / totalIncome) * 100 : 0
    
    let health = { label: 'Critique', color: 'text-red-600', bg: 'bg-red-100' }
    if (savingsRate > 20) health = { label: 'Excellente', color: 'text-emerald-600', bg: 'bg-emerald-100' }
    else if (savingsRate > 10) health = { label: 'Bonne', color: 'text-blue-600', bg: 'bg-blue-100' }
    else if (savingsRate > 0) health = { label: 'Stable', color: 'text-orange-600', bg: 'bg-orange-100' }

    return { 
      totalLimit, totalSpent, totalRemaining, progress, totalIncome, 
      savingsCapacity, totalScheduled, savingsRate, health 
    }
  })

  const dailySafeSpend = computed(() => {
    const now = new Date()
    if (currentDate.value.getMonth() !== now.getMonth() || currentDate.value.getFullYear() !== now.getFullYear()) return null
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1)
    return globalStats.value.totalRemaining > 0 ? globalStats.value.totalRemaining / remainingDays : 0
  })

  const isCurrentMonth = computed(() => {
    const now = new Date()
    return currentDate.value.getMonth() === now.getMonth() && currentDate.value.getFullYear() === now.getFullYear()
  })

  return { budgetStats, globalStats, dailySafeSpend, isCurrentMonth, getProgressColor }
}