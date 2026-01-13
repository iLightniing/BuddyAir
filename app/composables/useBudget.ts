import { ref, computed, watch } from 'vue'

export const useBudget = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { categories, fetchCategories } = useCategories()

  // --- State ---
  const loading = ref(false)
  const currentDate = ref(new Date())
  const budgets = ref<any[]>([])
  const transactions = ref<any[]>([])
  const previousTransactions = ref<any[]>([])
  const incomeTransactions = ref<any[]>([])
  const scheduledTransactions = ref<any[]>([])
  const sortBy = ref('progress-desc')

  // --- Actions Date ---
  const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  }
  const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }
  const resetDate = () => {
    currentDate.value = new Date()
  }

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

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!user.value) return
    loading.value = true
    
    try {
      // 1. Budgets
      budgets.value = await pb.collection('budgets').getFullList({
        filter: `user = "${user.value.id}"`,
        sort: 'category'
      })
      budgets.value = budgets.value.map(b => ({ ...b }))

      // 2. Transactions du mois
      const start = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).toISOString()
      const end = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0, 23, 59, 59).toISOString()
      
      const txs = await pb.collection('transactions').getFullList({
        filter: `user = "${user.value.id}" && date >= "${start}" && date <= "${end}" && type = "expense"`,
        expand: 'account',
        sort: '-date'
      })
      transactions.value = txs.map(t => ({ ...t }))
      
      // 3. Transactions mois précédent
      const prevStart = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1).toISOString()
      const prevEnd = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 0, 23, 59, 59).toISOString()
      const prevTxs = await pb.collection('transactions').getFullList({
        filter: `user = "${user.value.id}" && date >= "${prevStart}" && date <= "${prevEnd}" && type = "expense"`,
      })
      previousTransactions.value = prevTxs.map(t => ({ ...t }))

      // 4. Revenus
      const incomeTxs = await pb.collection('transactions').getFullList({
        filter: `user = "${user.value.id}" && date >= "${start}" && date <= "${end}" && type = "income"`,
      })
      incomeTransactions.value = incomeTxs.map(t => ({ ...t }))

      // 5. Échéances
      const scheduled = await pb.collection('scheduled_transactions').getFullList({
        filter: `user = "${user.value.id}" && next_date >= "${start}" && next_date <= "${end}" && type = "expense"`,
      })
      scheduledTransactions.value = scheduled.map(s => ({ ...s }))

    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // --- Computed Stats ---
  const budgetStats = computed(() => {
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
      
      return {
        ...b,
        spent,
        remaining: b.amount - spent,
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

  watch(currentDate, fetchData)

  return {
    loading,
    currentDate,
    budgets,
    transactions,
    sortBy,
    prevMonth,
    nextMonth,
    resetDate,
    fetchData,
    fetchCategories,
    budgetStats,
    globalStats,
    dailySafeSpend,
    isCurrentMonth,
    getProgressColor
  }
}