import { getProgressColor as getColor, getPaceStatus as getStatus } from '~/utils/budget'

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
    return getColor(percentage)
  }

  const getPaceStatus = (percentage: number) => {
    return getStatus(percentage, currentDate.value)
  }

  // --- Computed Stats ---
  const budgetStats = computed(() => {
    const now = new Date()
    const isCurrent = currentDate.value.getMonth() === now.getMonth() && currentDate.value.getFullYear() === now.getFullYear()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1)

    // Helper pour résoudre le nom de catégorie (ID -> Nom)
    const getCategoryName = (t: any) => {
        // 1. Via expand (Relation)
        if (t.expand?.category) {
            const c = Array.isArray(t.expand.category) ? t.expand.category[0] : t.expand.category
            return c.name || c.label || c.title || ''
        }
        // 2. Via la liste des catégories (si expand a échoué ou absent)
        if (categories.value.length > 0) {
            const found = categories.value.find(c => c.id === t.category)
            if (found) return found.name
        }
        // 3. Fallback : valeur brute
        return t.category || ''
    }

    // Optimisation : Indexation des transactions par catégorie (O(N) au lieu de O(N*M))
    const txByCategory = new Map<string, number>()
    const txCountByCategory = new Map<string, number>()
    transactions.value.forEach(t => {
      if (t.type === 'expense') {
        const catName = getCategoryName(t)
        const key = catName.trim().toLowerCase()
        if (key) {
            txByCategory.set(key, (txByCategory.get(key) || 0) + Math.abs(t.amount))
            txCountByCategory.set(key, (txCountByCategory.get(key) || 0) + 1)
        }
      }
    })

    const prevTxByCategory = new Map<string, number>()
    previousTransactions.value.forEach(t => {
      if (t.type === 'expense') {
        const key = getCategoryName(t).trim().toLowerCase()
        if (key) prevTxByCategory.set(key, (prevTxByCategory.get(key) || 0) + Math.abs(t.amount))
      }
    })

    const scheduledByCategory = new Map<string, number>()
    scheduledTransactions.value.forEach(t => {
      if (t.type === 'expense') {
        const key = getCategoryName(t).trim().toLowerCase()
        if (key) scheduledByCategory.set(key, (scheduledByCategory.get(key) || 0) + Math.abs(t.amount))
      }
    })

    const stats = budgets.value.map(b => {
      const key = b.category.trim().toLowerCase()
      const spent = txByCategory.get(key) || 0
      const prevSpent = prevTxByCategory.get(key) || 0
      const scheduled = scheduledByCategory.get(key) || 0
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
        transactionCount: txCountByCategory.get(key) || 0,
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