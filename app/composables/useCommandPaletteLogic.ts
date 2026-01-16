import { useCommandPalette } from '@/composables/useCommandPalette'

type CommandItem = {
  id: string
  label: string
  subLabel?: string
  icon: string
  type: string
  to?: string
  action?: () => any
}

export const useCommandPaletteLogic = () => {
  const { isOpen, close } = useCommandPalette()
  const router = useRouter()
  const pb = usePocketBase()
  const user = usePocketBaseUser()

  const query = ref('')
  const selectedIndex = ref(0)
  const searchInput = ref<HTMLInputElement | null>(null)
  const accounts = ref<any[]>([])
  const transactionResults = ref<CommandItem[]>([])

  const staticActions = [
    { id: 'home', label: 'Tableau de bord', icon: 'lucide:layout-dashboard', type: 'navigation', to: '/dashboard' },
    { id: 'accounts', label: 'Mes Comptes', icon: 'lucide:wallet', type: 'navigation', to: '/dashboard/accounts' },
    { id: 'budget', label: 'Budget', icon: 'lucide:pie-chart', type: 'navigation', to: '/dashboard/budget' },
    { id: 'projects', label: 'Projets', icon: 'lucide:rocket', type: 'navigation', to: '/dashboard/projects' },
    { id: 'stats', label: 'Analyses', icon: 'lucide:bar-chart-3', type: 'navigation', to: '/dashboard/stats' },
    { id: 'support', label: 'Support Client', icon: 'lucide:life-buoy', type: 'navigation', to: '/dashboard/support' },
    { id: 'profile', label: 'Mon Profil', icon: 'lucide:user', type: 'navigation', to: '/dashboard/profile' },
    { id: 'new-account', label: 'Ajouter un compte', icon: 'lucide:plus-circle', type: 'action', action: () => navigateTo('/dashboard/accounts') },
  ]

  const filteredResults = computed<CommandItem[]>(() => {
    const q = query.value.toLowerCase()
    const actions = staticActions.filter(a => a.label.toLowerCase().includes(q))
    const accountResults = accounts.value
      .filter(acc => acc.name.toLowerCase().includes(q) || acc.bank.toLowerCase().includes(q))
      .map(acc => ({
        id: `acc-${acc.id}`,
        label: acc.name,
        subLabel: acc.bank,
        icon: acc.account_group === 'savings' ? 'lucide:piggy-bank' : 'lucide:credit-card',
        type: 'account',
        to: `/dashboard/accounts/${acc.id}`
      }))
    return [...actions, ...accountResults, ...transactionResults.value]
  })

  const executeAction = (item: CommandItem) => {
    if (!item) return
    if (item.to) router.push(item.to)
    else if (item.action) item.action()
    close()
  }

  const onKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      isOpen.value ? close() : (isOpen.value = true)
    }
    if (!isOpen.value) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % filteredResults.value.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value - 1 + filteredResults.value.length) % filteredResults.value.length
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filteredResults.value[selectedIndex.value]
      if (item) executeAction(item)
    } else if (e.key === 'Escape') {
      close()
    }
  }

  let searchTimeout: any
  watch(query, (val) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      if (!val || val.length < 2 || !user.value) {
        transactionResults.value = []
        return
      }
      try {
        const res = await pb.collection('transactions').getList(1, 5, {
          filter: `user = "${user.value.id}" && (description ~ "${val}" || category ~ "${val}")`,
          expand: 'account',
          sort: '-date'
        })
        transactionResults.value = res.items.map(tx => ({
          id: `tx-${tx.id}`,
          label: tx.description,
          subLabel: `${new Date(tx.date).toLocaleDateString('fr-FR')} • ${tx.expand?.account?.name || 'Compte'} • ${tx.amount} €`,
          icon: 'lucide:receipt',
          type: 'transaction',
          to: `/dashboard/accounts/${tx.account}?date=${tx.date}`
        }))
      } catch {}
    }, 300)
  })

  return {
    isOpen, close, query, selectedIndex, searchInput, filteredResults,
    executeAction, onKeydown, accounts, user, pb
  }
}