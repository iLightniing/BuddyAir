<script setup lang="ts">

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  sub_category?: string
  payment_method: string
  status: string
  pointed_at?: string
  is_recurring?: boolean
  running_balance: number
  tags?: string[]
}

const props = defineProps<{
  transactions: Transaction[]
  loading: boolean
  selectedTransactions: string[]
  currency: string
  accountGroup?: string
}>()

const emit = defineEmits(['update:selectedTransactions', 'edit', 'delete', 'toggle-pointed', 'duplicate'])

const { getPaymentMethodLabel, getPaymentMethodIcon, fetchPaymentMethods } = usePaymentMethods()
const { tags, fetchTags, getTagClass } = useTags()

onMounted(() => { fetchPaymentMethods(); fetchTags() })

const getTagInfo = (id: string) => {
   return tags.value.find(t => t.id === id)
}

const allSelected = computed(() => {
  return props.transactions.length > 0 && props.selectedTransactions.length === props.transactions.length
})

const toggleAll = (checked?: boolean) => {
  if (checked) {
    emit('update:selectedTransactions', props.transactions.map(tx => tx.id))
  } else {
    emit('update:selectedTransactions', [])
  }
}

const toggleSelection = (id: string, checked?: boolean) => {
  const newSelection = [...props.selectedTransactions]
  if (checked) newSelection.push(id)
  else {
    const index = newSelection.indexOf(id)
    if (index > -1) newSelection.splice(index, 1)
  }
  emit('update:selectedTransactions', newSelection)
}

// --- Action Menu Logic ---
const openActionId = ref<string | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

const toggleActions = (event: MouseEvent, id: string) => {
  if (openActionId.value === id) {
    openActionId.value = null
    return
  }
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  menuPosition.value = { top: rect.bottom + 5, left: rect.right - 160 } // 160px approx width
  openActionId.value = id
}

onMounted(() => {
  window.addEventListener('click', (e) => { if (!(e.target as Element).closest('.action-trigger')) openActionId.value = null })
  window.addEventListener('scroll', () => openActionId.value = null, true)
})
</script>

<template>
    <div class="bg-ui-surface border border-ui-border rounded-md shadow-sm overflow-hidden">
      <div v-if="loading" class="p-20 flex justify-center">
        <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
      </div>
      
      <div v-else-if="transactions.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-ui-border bg-ui-surface-muted/50">
              <th class="p-3 pl-6 w-12 text-center">
                <UiCheckbox :model-value="allSelected" @update:model-value="toggleAll" />
              </th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest w-28">Date</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest min-w-[150px]">Description</th>
              <!-- Catégorie fusionnée dans Description -->
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest w-24">Type</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">{{ accountGroup === 'credit' ? 'Frais' : 'Débit' }}</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">{{ accountGroup === 'credit' ? 'Versé' : 'Crédit' }}</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-center w-16">Pointé</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">{{ accountGroup === 'credit' ? 'Capital Restant' : 'Solde' }}</th>
              <th class="p-3 pr-6 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-14"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ui-border">
            <tr v-for="tx in transactions" :key="tx.id" class="group hover:bg-white hover:shadow-lg hover:z-10 relative transition-all duration-200">
              <td class="p-3 pl-6 align-top text-center">
                <UiCheckbox :model-value="selectedTransactions.includes(tx.id)" @update:model-value="(val) => toggleSelection(tx.id, val)" />
              </td>
              <!-- Date -->
              <td class="p-3 text-sm font-bold text-ui-content-muted tabular-nums align-top whitespace-nowrap">
                <div class="flex flex-col">
                  <span>{{ new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }}</span>
                  <span v-if="tx.pointed_at" class="text-[10px] text-emerald-600 font-medium mt-0.5">
                    Validé le {{ new Date(tx.pointed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }}
                  </span>
                </div>
              </td>
              
              <!-- Description -->
              <td class="p-3 align-top">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-ui-content">{{ tx.description || 'Sans description' }}</span>
                    <div v-if="tx.is_recurring" class="group/tooltip relative flex items-center justify-center w-5 h-5 rounded-full bg-purple-50 text-purple-600 font-black text-xs cursor-help">
                      R
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Transaction récurrente
                        <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                    <div v-if="tx.payment_method === 'transfer'" class="group/tooltip relative flex items-center justify-center w-5 h-5 rounded-full bg-orange-50 text-orange-600 cursor-help">
                      <Icon name="lucide:arrow-right-left" class="w-3 h-3" />
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Virement inter-compte
                        <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <!-- Catégorie (Badge) -->
                  <div class="flex items-center gap-2 flex-wrap mt-1">
                    <span class="inline-flex self-start items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-ui-surface-muted border border-ui-border text-ui-content-muted">
                      {{ tx.category }}
                    </span>
                    <span v-if="tx.sub_category" class="flex items-center gap-1 text-[10px] text-ui-content-muted font-medium">
                      <Icon name="lucide:chevron-right" class="w-3 h-3 opacity-50" />
                      {{ tx.sub_category }}
                    </span>
                    <!-- Tags -->
                    <span v-for="tagId in (tx.tags || [])" :key="tagId" class="px-1.5 py-0.5 rounded text-[9px] font-bold border" :class="getTagInfo(tagId) ? getTagClass(getTagInfo(tagId).color) : 'bg-gray-100 text-gray-500 border-gray-200'">
                      #{{ getTagInfo(tagId)?.name || '?' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="p-3 align-top">
                <div class="flex items-center gap-2" :title="tx.payment_method">
                  <div class="w-6 h-6 rounded-md flex items-center justify-center bg-ui-surface-muted text-ui-content-muted">
                    <Icon :name="getPaymentMethodIcon(tx.payment_method)" class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-xs font-medium text-ui-content-muted hidden xl:inline-block capitalize">
                    {{ getPaymentMethodLabel(tx.payment_method) }}
                  </span>
                </div>
              </td>

              <!-- Débit -->
              <td class="p-3 text-right font-black tabular-nums text-sm text-red-600 align-top whitespace-nowrap">
                <span v-if="tx.type === 'expense'">-{{ tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
              </td>

              <!-- Crédit -->
              <td class="p-3 text-right font-black tabular-nums text-sm text-emerald-600 align-top whitespace-nowrap">
                <span v-if="tx.type === 'income'">+{{ tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
              </td>

              <!-- Pointé -->
              <td class="p-3 text-center align-top" @click.stop>
                <div class="flex justify-center">
                  <UiCheckbox :model-value="tx.status === 'completed'" @update:model-value="(val) => emit('toggle-pointed', tx, val)" />
                </div>
              </td>

              <!-- Solde -->
              <td class="p-3 text-right font-bold tabular-nums text-sm align-top whitespace-nowrap" :class="tx.running_balance >= 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ tx.running_balance.toLocaleString('fr-FR', { style: 'currency', currency: currency }) }}
              </td>

              <!-- Action -->
              <td class="p-3 pr-6 text-right align-top">
                <button @click.stop="toggleActions($event, tx.id)" class="action-trigger w-8 h-8 flex items-center justify-center hover:bg-ui-surface-muted text-ui-content-muted hover:text-ui-content rounded-lg transition-colors">
                  <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-center opacity-60 hover:opacity-100 transition-opacity">
        <div class="w-12 h-12 bg-ui-surface-muted rounded-md flex items-center justify-center mb-3 text-ui-content-muted">
          <Icon name="lucide:receipt" class="w-6 h-6" />
        </div>
        <p class="text-sm font-medium text-ui-content-muted">Aucune opération pour le moment.</p>
      </div>
    </div>

    <!-- Dropdown Menu (Teleported to body to avoid overflow clipping) -->
    <Teleport to="body">
      <div v-if="openActionId" class="fixed z-[9999] bg-ui-surface border border-ui-border rounded-xl shadow-xl py-1 w-40 animate-in fade-in zoom-in-95 duration-100" :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }">
        <button @click="emit('duplicate', transactions.find(t => t.id === openActionId)); openActionId = null" class="w-full text-left px-4 py-2 text-sm text-ui-content hover:bg-ui-surface-muted flex items-center gap-2">
          <Icon name="lucide:copy" class="w-4 h-4 text-purple-500" />
          Dupliquer
        </button>
        <button @click="emit('edit', transactions.find(t => t.id === openActionId)); openActionId = null" class="w-full text-left px-4 py-2 text-sm text-ui-content hover:bg-ui-surface-muted flex items-center gap-2">
          <Icon name="lucide:pencil" class="w-4 h-4 text-blue-500" />
          Modifier
        </button>
        <div class="h-px bg-ui-border my-1"></div>
        <button @click="emit('delete', transactions.find(t => t.id === openActionId)); openActionId = null" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
          <Icon name="lucide:trash-2" class="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </Teleport>
</template>