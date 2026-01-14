export const useDashboardData = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()

  const loading = ref(true)
  const accounts = ref<any[]>([])
  const recentTransactions = ref<any[]>([])
  const upcomingSchedules = ref<any[]>([])

  const totalBalance = computed(() => accounts.value.reduce((sum, acc) => sum + acc.current_balance, 0))

  const fetchData = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sevenDaysFromNow = new Date(today)
      sevenDaysFromNow.setDate(today.getDate() + 7)

      const [accountsResult, transactionsResult, schedulesResult] = await Promise.all([
        pb.collection('accounts').getFullList({ 
          filter: `user = "${user.value.id}"`,
          sort: '+order',
        }),
        pb.collection('transactions').getList(1, 5, {
          filter: `user = "${user.value.id}"`,
          sort: '-date,-created',
          expand: 'account'
        }),
        pb.collection('scheduled_transactions').getFullList({
          filter: `user = "${user.value.id}" && next_date >= "${today.toISOString()}" && next_date <= "${sevenDaysFromNow.toISOString()}"`,
          sort: 'next_date',
          expand: 'account'
        })
      ])

      accounts.value = accountsResult
      recentTransactions.value = transactionsResult.items
      upcomingSchedules.value = schedulesResult

    } catch (e) {
      console.error("Erreur chargement dashboard data:", e)
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

  return {
    loading,
    totalBalance,
    accounts,
    recentTransactions,
    upcomingSchedules,
    fetchData,
    getTransactionIcon,
    getTransactionClass,
  }
}