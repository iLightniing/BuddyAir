export const useFinancialStats = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const loading = ref(true)

  // Filtre
  const selectedAccountId = ref('all')
  const accounts = ref<any[]>([])

  // Données
  const currentMonthStats = ref({ income: 0, expense: 0, savingsRate: 0 })
  const historyData = ref<number[]>([])
  const historyLabels = ref<string[]>([])
  const cashFlowHistory = ref<{ label: string, income: number, expense: number }[]>([])
  const trends = ref({ income: 0, expense: 0, netWorth: 0 })
  const topExpenses = ref<any[]>([])
  const netWorth = ref(0)
  const pendingRecurring = ref(0)
  const safeToSpend = ref(0)
  const categoryData = ref<{ label: string, value: number, color: string, percentage: number }[]>([])

  // Couleurs pour les catégories
  const chartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4']

  const fetchData = async () => {
    if (!user.value) return
    loading.value = true
    
    try {
      const now = new Date()
      
      // 1. Récupérer les comptes (pour le sélecteur et le solde)
      const allAccounts = await pb.collection('accounts').getFullList({ 
        filter: `user = "${user.value.id}"`,
        sort: '+name',
        requestKey: null
      })
      accounts.value = allAccounts

      // 2. Récupérer les transactions (filtrées)
      let filter = `user = "${user.value.id}"`
      if (selectedAccountId.value !== 'all') filter += ` && account = "${selectedAccountId.value}"`

      const transactions = await pb.collection('transactions').getFullList({
        filter,
        sort: '-date',
        requestKey: null
      })

      // --- Stats du mois en cours ---
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthTx = transactions.filter(t => new Date(t.date) >= startOfMonth)
      
      const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      currentMonthStats.value = {
        income,
        expense,
        savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
      }

      // --- Top Dépenses (Mois en cours) ---
      topExpenses.value = monthTx
        .filter(t => t.type === 'expense')
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 5)

      // --- Répartition par catégorie (Mois en cours) ---
      const expensesByCategory: Record<string, number> = {}
      monthTx.filter(t => t.type === 'expense').forEach(t => {
        const cat = t.category || 'Autre'
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Math.abs(t.amount)
      })

      const sortedCategories = Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6) // Top 6 catégories
      
      categoryData.value = sortedCategories.map(([label, value], index) => ({
        label,
        value,
        color: chartColors[index % chartColors.length] || '#cccccc',
        percentage: expense > 0 ? (value / expense) * 100 : 0
      }))

      // --- Calcul du Solde Actuel (Global ou Compte spécifique) ---
      let currentTotalBalance = 0
      if (selectedAccountId.value === 'all') {
        currentTotalBalance = allAccounts.reduce((sum, acc) => sum + acc.current_balance, 0)
      } else {
        const acc = allAccounts.find(a => a.id === selectedAccountId.value)
        currentTotalBalance = acc ? acc.current_balance : 0
      }
      netWorth.value = currentTotalBalance

      // --- Estimation du Reste à vivre (Safe-to-Spend) ---
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      
      const recurringTx = transactions.filter(t => 
        t.is_recurring && 
        t.type === 'expense' &&
        new Date(t.date) >= lastMonthStart && 
        new Date(t.date) <= lastMonthEnd
      )

      let estimatedPending = 0
      recurringTx.forEach(rt => {
        const hasOccurred = monthTx.some(t => t.description === rt.description && Math.abs(t.amount - rt.amount) < 5)
        if (!hasOccurred) estimatedPending += rt.amount
      })
      
      pendingRecurring.value = estimatedPending
      safeToSpend.value = netWorth.value - estimatedPending

      const months = []
      const balances = []
      const cashFlow = []
      let runningBalance = currentTotalBalance
      
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleDateString('fr-FR', { month: 'short' })

        // Calcul Cash Flow pour ce mois spécifique
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        const txInThisMonth = transactions.filter(t => {
           const tDate = new Date(t.date)
           return tDate >= monthStart && tDate <= monthEnd
        })
        const mIncome = txInThisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const mExpense = txInThisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        if (i > 0) {
          // On remonte le temps : on inverse les transactions du mois suivant pour retrouver le solde précédent
          const monthToRevertStart = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
          const monthToRevertEnd = new Date(now.getFullYear(), now.getMonth() - i + 2, 1)

          const txToRevert = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate >= monthToRevertStart && tDate < monthToRevertEnd
          })

          txToRevert.forEach(t => {
            if (t.type === 'expense') runningBalance += Math.abs(t.amount)
            else runningBalance -= t.amount
          })
        }
        
        months.unshift(label)
        balances.unshift(runningBalance)
        cashFlow.unshift({ label, income: mIncome, expense: mExpense })
      }
      
      historyLabels.value = months
      historyData.value = balances
      cashFlowHistory.value = cashFlow

      // --- Calcul des Tendances (vs Mois précédent) ---
      const currentFlow = cashFlow[cashFlow.length - 1] || { income: 0, expense: 0 }
      const prevFlow = cashFlow[cashFlow.length - 2] || { income: 0, expense: 0 }
      const currentBalance = balances[balances.length - 1] || 0
      const prevBalance = balances[balances.length - 2] || 0

      const calcTrend = (curr: number, prev: number) => prev !== 0 ? ((curr - prev) / prev) * 100 : 0

      trends.value.income = calcTrend(currentFlow.income, prevFlow.income)
      trends.value.expense = calcTrend(currentFlow.expense, prevFlow.expense)
      trends.value.netWorth = calcTrend(currentBalance, prevBalance)

    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const conicGradientStyle = computed(() => {
    let currentAngle = 0
    const segments = categoryData.value.map(cat => {
      const start = currentAngle
      const end = currentAngle + cat.percentage
      currentAngle = end
      return `${cat.color} ${start}% ${end}%`
    })
    if (segments.length === 0) return 'conic-gradient(#f1f5f9 0% 100%)'
    return `conic-gradient(${segments.join(', ')})`
  })

  // Recharger quand le compte change
  watch(selectedAccountId, fetchData)

  return {
    loading, currentMonthStats, historyData, historyLabels, cashFlowHistory, topExpenses, netWorth, pendingRecurring, safeToSpend, categoryData, trends,
    fetchData, conicGradientStyle, selectedAccountId, accounts
  }
}