export const useScheduleManager = () => {
  const route = useRoute()
  const pb = usePocketBase()
  
  const accountId = computed(() => route.query.account as string)
  const loading = ref(true)
  const items = ref<any[]>([])
  const accountName = ref('')

  const fetchItems = async () => {
    const user = pb.authStore.model
    if (!user) return

    loading.value = true
    try {
      let filter = `user = "${user.id}"`

      if (accountId.value) {
        filter += ` && account = "${accountId.value}"`
        try {
          const acc = await pb.collection('accounts').getOne(accountId.value)
          accountName.value = acc.name
        } catch {}
      } else {
        accountName.value = ''
      }

      const result = await pb.collection('scheduled_transactions').getList(1, 500, {
        filter,
        sort: '+next_date',
        expand: 'account',
        requestKey: null
      })
      items.value = result.items
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const groupedItems = computed(() => {
    const groups: Record<string, { id: string, accountName: string, items: any[], totalDebit: number, totalCredit: number }> = {}
    
    for (const item of items.value) {
      const accId = item.account || 'unknown'
      const accName = item.expand?.account?.name || (accountId.value ? accountName.value : 'Compte inconnu')
      
      if (!groups[accId]) {
        groups[accId] = { id: accId, accountName: accName, items: [], totalDebit: 0, totalCredit: 0 }
      }
      
      groups[accId].items.push(item)
      
      if (item.type === 'expense') {
        groups[accId].totalDebit += item.amount
      } else {
        groups[accId].totalCredit += item.amount
      }
    }

    return Object.values(groups).sort((a, b) => a.accountName.localeCompare(b.accountName))
  })

  watch(() => route.query.account, fetchItems, { immediate: true })

  return {
    accountId, loading, items, accountName, fetchItems, groupedItems
  }
}