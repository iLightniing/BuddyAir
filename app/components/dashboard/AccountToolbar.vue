<script setup lang="ts">
const props = defineProps<{
  account: any
  selectedTransactions: string[]
  currentMonthLabel: string
  balances: { current: number, cleared: number, projected: number }
  searchQuery: string
  filterType: string
  filterStatus: string
  showBalances?: boolean
}>()

const emit = defineEmits([
  'add', 'prev-month', 'next-month', 'show-amortization',
  'bulk-point', 'bulk-delete', 'export', 'export-json',
  'update:searchQuery', 'update:filterType', 'update:filterStatus'
])

const showOptions = ref(false)
const optionsDropdownRef = ref<HTMLElement | null>(null)

const typeOptions = [
  { label: 'Tous types', value: 'all' },
  { label: 'Revenus', value: 'income' },
  { label: 'Dépenses', value: 'expense' }
]

const statusOptions = [
  { label: 'Tous statuts', value: 'all' },
  { label: 'Pointés', value: 'completed' },
  { label: 'En attente', value: 'pending' }
]

const handleClickOutside = (event: MouseEvent) => {
  if (showOptions.value && optionsDropdownRef.value && !optionsDropdownRef.value.contains(event.target as Node)) {
    showOptions.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div v-if="account" class="sticky top-14 z-30 bg-ui-surface/80 backdrop-blur-md border border-ui-border rounded-2xl p-2 shadow-sm transition-all duration-300">
    <div class="grid grid-cols-1 xl:grid-cols-3 items-center gap-4">
      
      <!-- Gauche: Actions -->
      <div class="flex items-center gap-2 w-full xl:w-auto justify-self-start">
        <NuxtLink to="/dashboard/accounts" class="w-10 h-10 flex items-center justify-center bg-ui-surface hover:bg-ui-surface-muted border border-ui-border rounded-xl text-ui-content transition-all shadow-sm shrink-0">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        
        <button @click="emit('add')" class="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-transform hover:scale-105 active:scale-95 shrink-0" title="Nouvelle opération">
          <Icon name="lucide:plus" class="w-5 h-5" />
        </button>

        <NuxtLink :to="`/dashboard/schedule?account=${account.id}`" class="w-10 h-10 flex items-center justify-center bg-ui-surface hover:bg-ui-surface-muted border border-ui-border rounded-xl text-ui-content transition-all shadow-sm shrink-0" title="Échéancier">
          <Icon name="lucide:calendar-clock" class="w-5 h-5" />
        </NuxtLink>

        <button v-if="account.account_group === 'credit'" @click="emit('show-amortization')" class="w-10 h-10 flex items-center justify-center bg-ui-surface hover:bg-ui-surface-muted border border-ui-border rounded-xl text-ui-content transition-all shadow-sm shrink-0" title="Tableau d'amortissement">
          <Icon name="lucide:table-2" class="w-5 h-5" />
        </button>

        <!-- Options Dropdown -->
        <div v-if="selectedTransactions.length > 0" class="relative" ref="optionsDropdownRef">
          <button @click="showOptions = !showOptions" class="w-10 h-10 flex items-center justify-center bg-ui-surface hover:bg-ui-surface-muted border border-ui-border rounded-xl text-ui-content transition-all shadow-sm relative">
            <Icon name="lucide:settings-2" class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm">{{ selectedTransactions.length }}</span>
          </button>
          
          <div v-if="showOptions" class="absolute top-full left-0 mt-2 w-48 bg-ui-surface border border-ui-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="p-1 space-y-0.5">
              <button @click="emit('bulk-point', true); showOptions = false" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-ui-content hover:bg-ui-surface-muted rounded-lg text-left">
                <Icon name="lucide:check" class="w-3.5 h-3.5 text-emerald-500" /> Pointer
              </button>
              <button @click="emit('bulk-point', false); showOptions = false" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-ui-content hover:bg-ui-surface-muted rounded-lg text-left">
                <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5 text-orange-500" /> Dépointer
              </button>
              <button @click="emit('bulk-delete'); showOptions = false" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left">
                <Icon name="lucide:trash-2" class="w-3.5 h-3.5" /> Supprimer
              </button>
              <div class="h-px bg-ui-border my-1"></div>
              <div class="px-3 py-1 text-[10px] font-black text-ui-content-muted uppercase tracking-wider">Export</div>
              <button @click="emit('export'); showOptions = false" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-ui-content hover:bg-ui-surface-muted rounded-lg text-left">
                <Icon name="lucide:file-spreadsheet" class="w-3.5 h-3.5" /> CSV
              </button>
              <button @click="emit('export-json'); showOptions = false" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-ui-content hover:bg-ui-surface-muted rounded-lg text-left">
                <Icon name="lucide:file-json" class="w-3.5 h-3.5" /> JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Centre: Timeline -->
      <div class="flex items-center justify-center w-full xl:w-auto justify-self-center">
        <div class="flex items-center bg-ui-surface-muted/50 rounded-full p-1 border border-ui-border/50 shrink-0">
          <button @click="emit('prev-month')" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-ui-content-muted hover:text-ui-content transition-all">
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
          </button>
          <span class="px-3 text-xs font-black text-ui-content capitalize min-w-[90px] text-center whitespace-nowrap">{{ currentMonthLabel }}</span>
          <button @click="emit('next-month')" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-ui-content-muted hover:text-ui-content transition-all">
            <Icon name="lucide:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Droite: Métriques (Soldes ou Custom) -->
      <div class="hidden xl:flex items-center justify-self-end w-full xl:w-auto justify-end">
        <!-- Slot pour contenu personnalisé (Crédit/Épargne) -->
        <slot name="metrics" />

        <!-- Soldes par défaut (Courant) -->
        <div v-if="showBalances" class="flex items-center gap-6 px-6 py-2 bg-ui-surface-muted/50 border border-ui-border/50 rounded-2xl shrink-0">
          <div class="flex flex-col items-center">
             <span class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest">Pointé</span>
             <span class="text-sm font-bold text-ui-content">{{ balances.cleared.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</span>
          </div>
          <div class="w-px h-6 bg-ui-border"></div>
          <div class="flex flex-col items-center">
             <span class="text-[9px] font-black text-blue-600 uppercase tracking-widest">Actuel</span>
             <span class="text-lg font-black text-blue-700">{{ balances.current.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</span>
          </div>
          <div class="w-px h-6 bg-ui-border"></div>
          <div class="flex flex-col items-center">
             <span class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest">Prévu</span>
             <span class="text-sm font-bold text-ui-content">{{ balances.projected.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Filtres & Recherche -->
  <div v-if="searchQuery || selectedTransactions.length === 0" class="flex flex-col md:flex-row items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 px-1 mt-4">
     <div class="relative w-full md:w-80">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted" />
        <input :value="searchQuery" @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)" type="text" placeholder="Rechercher..." class="w-full h-10 pl-9 pr-4 bg-ui-surface border border-ui-border hover:border-ui-content-muted rounded-xl text-xs font-bold text-ui-content placeholder:text-ui-content-muted focus:border-ui-content-muted focus:outline-none transition-all" />
     </div>

     <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="w-40 shrink-0">
          <UiDropdown :model-value="filterType" @update:model-value="emit('update:filterType', $event)" :options="typeOptions" />
        </div>
        <div class="w-40 shrink-0">
          <UiDropdown :model-value="filterStatus" @update:model-value="emit('update:filterStatus', $event)" :options="statusOptions" />
        </div>
     </div>
  </div>
</template>