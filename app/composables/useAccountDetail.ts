export function useAccountDetail(accountId: string) {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const route = useRoute()

  // --- Core State ---
  const loading = ref(true)
  const account = ref<any>(null)
  const transactions = ref<any[]>([])
  const pendingTransactions = ref<any[]>([])
  const futureTransactions = ref<any[]>([])
  const selectedTransactions = ref<string[]>([])

  // --- Timeline & Search ---
  const currentDate = ref(new Date())
  const searchQuery = ref('')
  let searchTimeout: any = null

  // --- Filters ---
  const filterType = ref('all')
  const filterStatus = ref('all')

  // --- Data Fetching ---
  const fetchData = async () => {
    loading.value = true
    selectedTransactions.value = []
    try {
      // 1. Fetch account details
      const acc = await pb.collection('accounts').getOne(accountId, { requestKey: null })
      account.value = { ...acc }
      if (account.value) route.meta.title = `Détails du compte<span class="hidden md:inline"> : ${account.value.name}</span>`

      // 2. Build filter for transactions
      let filter = `account = "${accountId}"`
      if (searchQuery.value && searchQuery.value.trim().length > 0) {
        const q = searchQuery.value.trim()
        filter += ` && (description ~ "${q}" || category ~ "${q}" || amount ~ "${q}")`
      } else {
        const start = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).toISOString()
        const end = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0, 23, 59, 59).toISOString()
        filter += ` && date >= "${start}" && date <= "${end}"`
      }
      
      // 3. Fetch transactions for the period/search
      const result = await pb.collection('transactions').getList(1, 500, { filter, sort: '-date,-created', requestKey: null })
      transactions.value = result.items.map(i => ({ ...i }))

      // 4. Fetch all pending and future transactions for balance calculations
      const nowISO = new Date().toISOString()
      const pending = await pb.collection('transactions').getFullList({ filter: `account = "${accountId}" && status = "pending"`, requestKey: null })
      pendingTransactions.value = pending.map(i => ({ ...i }))
      
      const future = await pb.collection('transactions').getFullList({ filter: `account = "${accountId}" && date > "${nowISO}"`, requestKey: null })
      futureTransactions.value = future.map(i => ({ ...i }))

    } catch (e: any) {
      console.error("Erreur détaillée PocketBase :", e)
      notify("Erreur lors du chargement des données", "error")
      navigateTo('/dashboard/accounts')
    } finally {
      loading.value = false
    }
  }

  const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
    fetchData()
  }
  const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
    fetchData()
  }

  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => fetchData(), 300)
  })

  onMounted(() => {
    if (route.query.date) {
      const queryDate = new Date(route.query.date as string)
      if (!isNaN(queryDate.getTime())) currentDate.value = queryDate
    }
    fetchData()
  })

  // --- Computed Logic ---
  
  // Calcul du solde progressif
  const transactionsWithBalance = computed(() => {
    if (!account.value) return []
    let balance = account.value.current_balance
    return transactions.value.map(tx => {
      const snapshotBalance = balance
      balance = tx.type === 'income' ? balance - tx.amount : balance + tx.amount
      return { ...tx, running_balance: snapshotBalance }
    })
  })

  // Transactions filtrées
  const filteredTransactions = computed(() => {
    return transactionsWithBalance.value.filter(tx => {
      const matchesType = filterType.value === 'all' || tx.type === filterType.value
      const txStatus = tx.status === 'completed' ? 'completed' : 'pending'
      const matchesStatus = filterStatus.value === 'all' || txStatus === filterStatus.value
      return matchesType && matchesStatus
    })
  })

  // Calcul des soldes (Pointé, Actuel, Prévu)
  const balances = computed(() => {
    if (!account.value) return { current: 0, cleared: 0, projected: 0 }
    const totalBalance = account.value.current_balance
    
    let pendingImpact = 0
    pendingTransactions.value.forEach(tx => {
      if (tx.type === 'expense') pendingImpact -= tx.amount
      else pendingImpact += tx.amount
    })
    const cleared = totalBalance - pendingImpact
    
    let futureImpact = 0
    futureTransactions.value.forEach(tx => {
      if (tx.type === 'expense') futureImpact -= tx.amount
      else futureImpact += tx.amount
    })
    const current = totalBalance - futureImpact

    const now = new Date()
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    let afterMonthImpact = 0
    futureTransactions.value.forEach(tx => {
      if (new Date(tx.date) > endOfCurrentMonth) {
         if (tx.type === 'expense') afterMonthImpact -= tx.amount
         else afterMonthImpact += tx.amount
      }
    })
    const projected = totalBalance - afterMonthImpact
    return { current, cleared, projected }
  })

  return {
    loading, account, transactions, pendingTransactions, futureTransactions,
    selectedTransactions,
    currentDate, searchQuery,
    fetchData, prevMonth, nextMonth,
    filterType, filterStatus, filteredTransactions, balances
  }
}