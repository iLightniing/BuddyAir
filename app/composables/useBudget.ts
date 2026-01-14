import { useBudgetStats } from './useBudgetStats'

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

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!user.value) return
    loading.value = true
    
    try {
      // 1. Budgets
      budgets.value = await pb.collection('budgets').getFullList({
        filter: `user = "${user.value.id}"`,
        sort: '+order'
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

  // --- Computed Stats (Extracted) ---
  const { budgetStats, globalStats, dailySafeSpend, isCurrentMonth, getProgressColor } = useBudgetStats(
    budgets, transactions, previousTransactions, scheduledTransactions, incomeTransactions, currentDate, categories, sortBy
  )

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