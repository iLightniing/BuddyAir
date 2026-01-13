<script setup lang="ts">
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

const { isOpen, close } = useCommandPalette()
const router = useRouter()
const pb = usePocketBase()
const user = usePocketBaseUser()

const query = ref('')
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)
const accounts = ref<any[]>([])
const transactionResults = ref<CommandItem[]>([])

// --- Données ---
const staticActions = [
  { id: 'home', label: 'Tableau de bord', icon: 'lucide:layout-dashboard', type: 'navigation', to: '/dashboard' },
  { id: 'accounts', label: 'Mes Comptes', icon: 'lucide:wallet', type: 'navigation', to: '/dashboard/accounts' },
  { id: 'budget', label: 'Budget', icon: 'lucide:pie-chart', type: 'navigation', to: '/dashboard/budget' },
  { id: 'projects', label: 'Projets', icon: 'lucide:rocket', type: 'navigation', to: '/dashboard/projects' },
  { id: 'stats', label: 'Analyses', icon: 'lucide:bar-chart-3', type: 'navigation', to: '/dashboard/stats' },
  { id: 'profile', label: 'Mon Profil', icon: 'lucide:user', type: 'navigation', to: '/dashboard/profile' },
  { id: 'new-account', label: 'Ajouter un compte', icon: 'lucide:plus-circle', type: 'action', action: () => navigateTo('/dashboard/accounts') }, // Idéalement ouvrirait la modale directement
]

// Charger les comptes pour la recherche
onMounted(async () => {
  if (user.value) {
    try {
      const res = await pb.collection('accounts').getFullList({ 
        sort: '+name',
        requestKey: null
      })
      accounts.value = res
    } catch (e) {}
  }
  
  // Raccourci Clavier Ctrl+K / Cmd+K
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

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

// Focus l'input à l'ouverture
watch(isOpen, (val) => {
  if (val) {
    query.value = ''
    selectedIndex.value = 0
    nextTick(() => searchInput.value?.focus())
  }
})

// --- Recherche dynamique des transactions ---
let searchTimeout: any
const performSearch = async (val: string) => {
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
  } catch (e) {
    // Silencieux
  }
}

watch(query, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => performSearch(val), 300)
})

// --- Filtrage ---
const filteredResults = computed<CommandItem[]>(() => {
  const q = query.value.toLowerCase()
  
  // 1. Actions statiques
  const actions = staticActions.filter(a => a.label.toLowerCase().includes(q))
  
  // 2. Comptes
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
  
  if (item.to) {
    router.push(item.to)
  } else if (item.action) {
    item.action()
  }
  close()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>

      <!-- Palette -->
      <div class="w-full max-w-xl bg-ui-surface border border-ui-border rounded-xl shadow-2xl overflow-hidden relative flex flex-col max-h-[60vh]">
        
        <!-- Search Input -->
        <div class="flex items-center px-4 border-b border-ui-border">
          <Icon name="lucide:search" class="w-5 h-5 text-ui-content-muted" />
          <input 
            ref="searchInput"
            v-model="query"
            type="text" 
            placeholder="Rechercher une page, un compte, une action..." 
            class="w-full h-14 bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-4 text-ui-content placeholder:text-ui-content-muted/50 text-lg"
          />
          <div class="px-2 py-1 bg-ui-surface-muted border border-ui-border rounded text-[10px] font-bold text-ui-content-muted">ESC</div>
        </div>

        <!-- Results -->
        <div class="overflow-y-auto p-2">
          <div v-if="filteredResults.length === 0" class="p-8 text-center text-ui-content-muted">
             <Icon name="lucide:search-x" class="w-8 h-8 mx-auto mb-2 opacity-50" />
             <p class="text-sm">Aucun résultat trouvé.</p>
          </div>

          <button
            v-for="(item, index) in filteredResults"
            :key="item.id"
            @click="executeAction(item)"
            @mouseenter="selectedIndex = index"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left group"
            :class="index === selectedIndex ? 'bg-blue-600 text-white' : 'text-ui-content hover:bg-ui-surface-muted'"
          >
            <Icon :name="item.icon" class="w-5 h-5" :class="index === selectedIndex ? 'text-white' : 'text-ui-content-muted group-hover:text-ui-content'" />
            <div class="flex-1">
               <div class="font-medium text-sm">{{ item.label }}</div>
               <div v-if="item.subLabel" class="text-xs opacity-70">{{ item.subLabel }}</div>
            </div>
            <div v-if="item.type === 'navigation'" class="text-[10px] uppercase tracking-wider font-bold opacity-50">Aller à</div>
            <div v-if="item.type === 'action'" class="text-[10px] uppercase tracking-wider font-bold opacity-50">Action</div>
            <Icon v-if="index === selectedIndex" name="lucide:corner-down-left" class="w-4 h-4 opacity-50" />
          </button>
        </div>
        
        <!-- Footer -->
        <div class="px-4 py-2 bg-ui-surface-muted border-t border-ui-border flex justify-between items-center text-[10px] text-ui-content-muted font-medium">
           <span><span class="font-bold">↑↓</span> pour naviguer</span>
           <span><span class="font-bold">↵</span> pour valider</span>
        </div>
      </div>
    </div>
  </Transition>
</template>