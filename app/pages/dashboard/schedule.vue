<script setup lang="ts">
definePageMeta({ title: 'Échéancier' })

const route = useRoute()
const pb = usePocketBase()
const { notify } = useNotification()

const accountId = computed(() => route.query.account as string)
const loading = ref(true)
const items = ref<any[]>([])
const showModal = ref(false)
const itemToEdit = ref<any>(null)
const showDeleteModal = ref(false)
const itemToDelete = ref<any>(null)
const accountName = ref('')

const fetchItems = async () => {
  const user = pb.authStore.model
  if (!user) return

  loading.value = true
  try {
    let filter = `user = "${user.id}"`

    if (accountId.value) {
      filter += ` && account = "${accountId.value}"`
      // Fetch account name for title
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
    // Silent fail if collection doesn't exist yet or empty
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.account, fetchItems, {
  immediate: true
})

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

  // Tri par jour du mois puis par ordre alphabétique de la description
  const sortedGroups = Object.values(groups).sort((a, b) => a.accountName.localeCompare(b.accountName))
  
  for (const group of sortedGroups) {
    group.items.sort((a, b) => {
      const dayA = a.day_of_month || new Date(a.next_date).getDate()
      const dayB = b.day_of_month || new Date(b.next_date).getDate()
      
      if (dayA !== dayB) return dayA - dayB
      return (a.description || '').localeCompare(b.description || '')
    })
  }
  return sortedGroups
})

const handleBack = () => {
  if (accountId.value) {
    navigateTo(`/dashboard/accounts/${accountId.value}`)
  } else {
    navigateTo('/dashboard/accounts')
  }
}

const handleEdit = (item: any) => {
  itemToEdit.value = item
  showModal.value = true
}

const handleDelete = (item: any) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return
  try {
    await pb.collection('scheduled_transactions').delete(itemToDelete.value.id)
    notify('Échéance supprimée', 'success')
    showDeleteModal.value = false
    fetchItems()
  } catch (e) {
    notify('Erreur lors de la suppression', 'error')
  }
}

const getFrequencyLabel = (freq: string) => {
  const map: Record<string, string> = {
    'monthly': 'Mensuel',
    'weekly': 'Hebdomadaire',
    'yearly': 'Annuel',
    'quarterly': 'Trimestriel'
  }
  return map[freq] || freq
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <button @click="handleBack" class="inline-flex items-center gap-2 text-ui-content-muted hover:text-ui-content transition-colors mb-2 group">
          <Icon name="lucide:arrow-left" class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span class="text-xs font-bold uppercase tracking-widest">Retour</span>
        </button>
        <h1 class="text-2xl font-black text-ui-content tracking-tight">
          {{ accountName ? `Échéancier : ${accountName}` : 'Échéancier Global' }}
        </h1>
      </div>
      
      <UiButton @click="itemToEdit = null; showModal = true" class="shadow-lg shadow-blue-500/20">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Nouvelle échéance
      </UiButton>
    </div>

    <!-- Liste -->
    <div v-if="loading" class="py-20 flex justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <div v-else-if="groupedItems.length > 0" class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 items-start">
      <div 
        v-for="group in groupedItems" 
        :key="group.id" 
        class="bg-ui-surface border border-ui-border rounded-xl overflow-hidden flex flex-col shadow-sm"
      >
         <!-- Header of the card -->
         <div class="px-5 py-4 border-b border-ui-border bg-ui-surface-muted/30 flex justify-between items-center">
            <div class="flex items-center gap-2">
               <div class="w-8 h-8 rounded-lg bg-white border border-ui-border flex items-center justify-center text-ui-content-muted">
                  <Icon name="lucide:wallet" class="w-4 h-4" />
               </div>
               <h3 class="font-bold text-ui-content">{{ group.accountName }}</h3>
            </div>
            <div class="flex flex-col items-end gap-1">
               <div class="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                  <span v-if="group.totalCredit > 0" class="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Crédit: +{{ group.totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }}</span>
                  <span v-if="group.totalDebit > 0" class="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Débit: -{{ group.totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }}</span>
               </div>
               <div class="text-sm font-black tabular-nums" :class="(group.totalCredit - group.totalDebit) >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  Reste: {{ (group.totalCredit - group.totalDebit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}
               </div>
            </div>
         </div>
         
         <!-- Table -->
         <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
               <thead class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest bg-ui-surface-muted/50 border-b border-ui-border">
                  <tr>
                     <th class="px-4 py-3 w-16 text-center">Jour</th>
                     <th class="px-4 py-3">Description</th>
                     <th class="px-4 py-3 text-right">Montant</th>
                     <th class="px-4 py-3 text-right w-20"></th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-ui-border">
                  <tr v-for="item in group.items" :key="item.id" class="group hover:bg-ui-surface-muted/50 transition-colors">
                     <td class="px-4 py-3 align-top">
                        <div class="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-ui-surface border border-ui-border text-ui-content font-bold mx-auto">
                           {{ item.day_of_month || new Date(item.next_date).getDate() }}
                        </div>
                     </td>
                     <td class="px-4 py-3 align-top">
                        <div class="font-bold text-ui-content">{{ item.description }}</div>
                        <div class="flex items-center gap-2 mt-1">
                           <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-ui-surface-muted border border-ui-border text-ui-content-muted font-medium uppercase tracking-wide">
                              {{ getFrequencyLabel(item.frequency) }}
                           </span>
                           <span class="text-xs text-ui-content-muted">{{ item.category }}</span>
                        </div>
                     </td>
                     <td class="px-4 py-3 text-right font-black tabular-nums align-top pt-4" :class="item.type === 'income' ? 'text-emerald-600' : 'text-red-600'">
                        {{ item.type === 'income' ? '+' : '-' }}{{ item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} €
                     </td>
                     <td class="px-4 py-3 text-right align-top pt-3.5">
                        <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button @click="handleEdit(item)" class="w-7 h-7 flex items-center justify-center hover:bg-blue-50 text-blue-600 rounded-md transition-colors">
                              <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
                           </button>
                           <button @click="handleDelete(item)" class="w-7 h-7 flex items-center justify-center hover:bg-red-50 text-red-600 rounded-md transition-colors">
                              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>

    <DashboardEmptyState 
      v-else 
      icon="lucide:calendar-clock" 
      title="Aucune échéance" 
      message="Planifiez vos dépenses récurrentes pour mieux anticiper votre budget." 
    />

    <DashboardScheduleModal 
      :show="showModal" 
      :item="itemToEdit" 
      :preselected-account-id="accountId"
      @close="showModal = false" 
      @success="fetchItems" 
    />

    <!-- Modal de suppression -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer l'échéance ?</h3>
        </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer cette échéance de <span class="font-bold text-ui-content">{{ itemToDelete?.amount }} €</span> ?
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>