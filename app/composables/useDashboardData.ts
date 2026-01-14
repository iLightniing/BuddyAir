interface DashboardAccount {
  id: string
  name: string
  current_balance: number
  account_group: string
}

interface DashboardTransaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  description: string
  expand?: { account?: DashboardAccount }
}

export const useDashboardData = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()

  const loading = ref(false)
  const accounts = ref<DashboardAccount[]>([])
  const recentTransactions = ref<DashboardTransaction[]>([])
  const upcomingSchedules = ref<any[]>([]) // Schedule type complexe, on peut laisser any ou définir plus tard

  // --- Computed properties ---
  const totalCurrent = computed(() => (accounts.value || [])
    .filter(a => a.account_group === 'current')
    .reduce((sum, acc) => sum + acc.current_balance, 0))
  const totalSavings = computed(() => (accounts.value || [])
    .filter(a => a.account_group === 'savings')
    .reduce((sum, acc) => sum + acc.current_balance, 0))
  const totalCredit = computed(() => (accounts.value || [])
    .filter(a => a.account_group === 'credit')
    .reduce((sum, acc) => sum + acc.current_balance, 0))

  const fetchData = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const now = new Date().toISOString()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sevenDaysFromNow = new Date(today)
      sevenDaysFromNow.setDate(today.getDate() + 7)

      const [accountsResult, futureTransactions, transactionsResult, schedulesResult] = await Promise.all([
        pb.collection('accounts').getFullList({ 
          filter: `user = "${user.value.id}"`,
          sort: '+order',
          requestKey: null
        }),
        // Récupération des transactions futures pour ajuster le solde "À ce jour"
        pb.collection('transactions').getFullList({
          filter: `user = "${user.value.id}" && date > "${now}"`,
          fields: 'account,amount,type',
          requestKey: null
        }),
        pb.collection('transactions').getList(1, 5, {
          filter: `user = "${user.value.id}"`,
          sort: '-date,-created',
          expand: 'account',
          requestKey: null
        }),
        pb.collection('scheduled_transactions').getFullList({
          filter: `user = "${user.value.id}" && next_date >= "${today.toISOString()}" && next_date <= "${sevenDaysFromNow.toISOString()}"`,
          sort: 'next_date',
          expand: 'account',
          requestKey: null
        })
      ])

      const adjustments: Record<string, number> = {}
      futureTransactions.forEach((tx: any) => {
        const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
        adjustments[tx.account] = (adjustments[tx.account] || 0) + amount
      })

      accounts.value = accountsResult.map((record: any) => {
        const futureImpact = adjustments[record.id] || 0
        return { 
          ...record, 
          current_balance: record.current_balance - futureImpact 
        }
      }) as unknown as DashboardAccount[]

      recentTransactions.value = transactionsResult.items as unknown as DashboardTransaction[]
      upcomingSchedules.value = schedulesResult

    } catch (e) {
      // On ignore les erreurs d'annulation automatique (requêtes en double)
      if (!(e instanceof Error && e.name === 'AbortError') && !(e as any)?.isAbort) {
        console.error("Erreur chargement dashboard data:", e)
      }
    } finally {
      loading.value = false
    }
  }

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? 'lucide:arrow-up-right' : 'lucide:arrow-down-left'
  }

  const getTransactionClass = (type: string) => {
    return type === 'income'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
      : 'bg-red-50 border-red-200 text-red-600'
  }

  // Recharger si l'utilisateur change (ex: connexion tardive)
  watch(user, fetchData)

  return {
    loading,
    accounts,
    recentTransactions,
    upcomingSchedules,
    fetchData,
    getTransactionIcon,
    getTransactionClass,
    totalCurrent,
    totalSavings,
    totalCredit,
  }
}