import { CHART_COLORS, generateConicGradient } from '~/utils/chart'

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
        color: CHART_COLORS[index % CHART_COLORS.length] || '#cccccc',
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

      // --- Optimisation : Agrégation par mois en une seule passe ---
      const monthlyAggregates = new Map<string, { income: number, expense: number }>()
      transactions.forEach(t => {
         const d = new Date(t.date)
         const key = `${d.getFullYear()}-${d.getMonth()}` // Clé unique par mois
         if (!monthlyAggregates.has(key)) monthlyAggregates.set(key, { income: 0, expense: 0 })
         
         const agg = monthlyAggregates.get(key)!
         if (t.type === 'income') agg.income += t.amount
         else agg.expense += Math.abs(t.amount)
      })

      const months = []
      const balances = []
      const cashFlow = []
      let runningBalance = currentTotalBalance
      
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleDateString('fr-FR', { month: 'short' })
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const agg = monthlyAggregates.get(key) || { income: 0, expense: 0 }
        
        // On remonte le temps : Solde Précédent = Solde Actuel - Revenus + Dépenses
        if (i > 0) {
           // Pour l'itération i, on doit annuler l'effet du mois i-1 (qui est le mois "suivant" dans le passé)
           // Note: La logique de boucle ici est simplifiée : on affiche le solde à la FIN du mois i.
           // Pour avoir le solde à la fin du mois précédent, on doit inverser les mouvements du mois courant.
           // Mais comme on itère à l'envers, on doit ajuster runningBalance AVANT de push pour le mois suivant
        }
        // Correction logique simplifiée :
        // runningBalance est le solde à la fin du mois 'i'.
        // Pour le tour suivant (i+1, mois précédent), on doit retirer les revenus et ajouter les dépenses du mois 'i'.
        
        months.unshift(label)
        balances.unshift(runningBalance)
        cashFlow.unshift({ label, income: agg.income, expense: agg.expense })

        // Préparation pour le mois précédent
        runningBalance = runningBalance - agg.income + agg.expense
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
    return generateConicGradient(categoryData.value)
  })

  // Recharger quand le compte change
  watch(selectedAccountId, fetchData)

  return {
    loading, currentMonthStats, historyData, historyLabels, cashFlowHistory, topExpenses, netWorth, pendingRecurring, safeToSpend, categoryData, trends,
    fetchData, conicGradientStyle, selectedAccountId, accounts
  }
}