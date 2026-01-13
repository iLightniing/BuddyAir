<script setup lang="ts">
definePageMeta({
  title: 'Mes Comptes'
})

import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'

const pb = usePocketBase()
const { notify } = useNotification()
const loading = ref(true)
const showModal = ref(false)
const isEditMode = ref(false)
const accountToEdit = ref<any>(null)
const showDeleteModal = ref(false)
const accountToDelete = ref<any>(null)

const [parent, accounts] = useDragAndDrop<any>([], {
  plugins: [animations()],
  dragHandle: '.drag-handle', // Le drag ne fonctionne que sur les éléments ayant cette classe
  onDragend: () => updateOrder() // Sauvegarde automatique à la fin du drag
})

const fetchAccounts = async () => {
  loading.value = true
  try {
    // Tri par ordre personnalisé
    const data = await pb.collection('accounts').getFullList({ 
      sort: '+order',
      requestKey: null
    })
    // On convertit en POJO (Plain Old JavaScript Object) pour éviter les erreurs de sérialisation Nuxt (DevalueError)
    // et on met à jour la liste gérée par FormKit
    accounts.value = data?.map(record => ({ ...record })) || []
  } catch (e) {
    console.error("Erreur chargement comptes:", e)
  } finally {
    loading.value = false
  }
}
onMounted(fetchAccounts)

const handleEdit = (acc: any) => {
  accountToEdit.value = acc
  showModal.value = true
}

const handleDelete = async (acc: any) => {
  accountToDelete.value = acc
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!accountToDelete.value) return
  
  try {
    await pb.collection('accounts').delete(accountToDelete.value.id)
    fetchAccounts()
    showDeleteModal.value = false
    accountToDelete.value = null
  } catch (error) {
    notify('Erreur lors de la suppression', 'error')
  }
}

const updateOrder = async () => {
  // On met à jour l'ordre de chaque compte en fonction de sa nouvelle position
  const promises = accounts.value.map((acc, index) => {
    return pb.collection('accounts').update(acc.id, { order: index })
  })
  try {
    await Promise.all(promises)
  } catch (e) {
    console.error("Erreur sauvegarde ordre:", e)
  }
}

// --- Stats Patrimoine ---
const totalBalance = computed(() => accounts.value.reduce((sum, acc) => sum + acc.current_balance, 0))
const totalAssets = computed(() => accounts.value.filter(acc => acc.current_balance > 0).reduce((sum, acc) => sum + acc.current_balance, 0))
const totalDebts = computed(() => accounts.value.filter(acc => acc.current_balance < 0).reduce((sum, acc) => sum + acc.current_balance, 0))

// Ratio de santé financière (Pourcentage de patrimoine net par rapport aux actifs bruts)
const healthRatio = computed(() => {
  if (totalAssets.value === 0) return 0
  return Math.max(0, (totalBalance.value / totalAssets.value) * 100)
})

// Groupement des comptes
const groupedAccounts = computed(() => {
  const groups: Record<string, any[]> = {
    checking: [],
    savings: [],
    loan: [],
    other: []
  }
  
  accounts.value.forEach(acc => {
    const type = acc.account_group || 'other'
    if (groups[type]) groups[type].push(acc)
    else groups.other!.push(acc)
  })
  
  return [
    { id: 'checking', label: 'Comptes Courants', items: groups.checking, icon: 'lucide:credit-card' },
    { id: 'savings', label: 'Épargne & Placements', items: groups.savings, icon: 'lucide:piggy-bank' },
    { id: 'loan', label: 'Crédits & Emprunts', items: groups.loan, icon: 'lucide:landmark' },
    { id: 'other', label: 'Autres', items: groups.other, icon: 'lucide:wallet' }
  ].filter(g => (g.items?.length || 0) > 0)
})
</script>
<template>
  <div class="space-y-6 min-h-[400px]">
    <!-- Loader -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
    </div>

    <div v-show="!loading" class="space-y-6">
        <!-- Résumé Patrimoine -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
           <!-- Solde Net -->
           <div class="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-900/10 relative overflow-hidden group">
              <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Icon name="lucide:landmark" class="w-16 h-16" />
              </div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patrimoine Net</p>
              <p class="text-3xl font-black tracking-tight">{{ totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</p>
              
              <!-- Jauge de santé -->
              <div class="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-400 transition-all duration-1000" :style="{ width: `${healthRatio}%` }"></div>
              </div>
           </div>

           <!-- Actifs -->
           <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div class="absolute right-0 top-0 p-4 opacity-5 text-emerald-500">
                 <Icon name="lucide:trending-up" class="w-16 h-16" />
              </div>
              <p class="text-xs font-bold text-ui-content-muted uppercase tracking-widest mb-1">Actifs (Disponibles)</p>
              <p class="text-2xl font-black text-emerald-600">+{{ totalAssets.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</p>
           </div>

           <!-- Passifs -->
           <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div class="absolute right-0 top-0 p-4 opacity-5 text-red-500">
                 <Icon name="lucide:trending-down" class="w-16 h-16" />
              </div>
              <p class="text-xs font-bold text-ui-content-muted uppercase tracking-widest mb-1">Passifs (Dettes)</p>
              <p class="text-2xl font-black text-red-600">{{ totalDebts === 0 ? '0,00 €' : totalDebts.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</p>
           </div>
        </div>

        <!-- Barre d'actions -->
        <div class="flex flex-row justify-end items-center gap-3">
          <button @click="navigateTo('/dashboard/schedule')" class="inline-flex justify-center items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-sm cursor-pointer rounded-md hover:scale-105 active:scale-95" title="Échéancier">
            <Icon name="lucide:calendar-clock" class="w-4 h-4" />
            <span class="hidden sm:inline">Échéancier</span>
          </button>
          <button 
            v-if="accounts.length > 0"
            @click="isEditMode = !isEditMode"
            class="inline-flex justify-center items-center gap-2 px-3 sm:px-4 py-2 bg-ui-surface hover:bg-ui-surface-muted rounded-md border border-ui-border text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            :class="isEditMode ? 'bg-blue-50 border-blue-200 text-blue-600' : 'text-orange-500'"
          >
            <Icon :name="isEditMode ? 'lucide:check' : 'lucide:pencil'" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ isEditMode ? 'Terminer' : 'Modifier' }}</span>
          </button>
          <button 
            @click="accountToEdit = null; showModal = true"
            class="inline-flex justify-center items-center gap-2 px-3 sm:px-4 py-2 bg-ui-surface hover:bg-ui-surface-muted rounded-md border border-ui-border text-ui-content text-xs font-bold transition-all shadow-sm cursor-pointer group hover:scale-105 active:scale-95"
          >
            <Icon name="lucide:plus" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 text-blue-500" />
            <span class="hidden sm:inline">Ajouter un compte</span>
          </button>
        </div>

        <!-- Mode Lecture : Vue Groupée -->
        <div v-if="!isEditMode" class="space-y-8">
          <div v-for="group in groupedAccounts" :key="group.id" class="space-y-3">
            <h3 class="text-sm font-black text-ui-content-muted uppercase tracking-widest flex items-center gap-2 px-1">
              <Icon :name="group.icon" class="w-4 h-4" /> {{ group.label }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="acc in group.items" :key="acc.id" class="h-full">
                <DashboardAccountCard 
                  :account="acc" 
                  :is-edit-mode="false"
                  @edit="handleEdit"
                  @delete="handleDelete"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mode Édition : Vue à plat (Drag & Drop) -->
        <div v-else ref="parent" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="acc in accounts" 
            :key="acc.id"
            class="h-full drag-handle"
          >
            <DashboardAccountCard 
              :account="acc" 
              :is-edit-mode="true"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </div>
        </div>

        <!-- État vide -->
        <div v-if="accounts.length === 0" class="relative bg-ui-surface border border-ui-border rounded-md p-6 sm:p-12 text-center shadow-sm">
          <div class="w-16 h-16 bg-ui-surface-muted rounded-2xl flex items-center justify-center mb-6 mx-auto text-ui-content-muted/20">
            <Icon name="lucide:wallet-minimal" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-black text-ui-content mb-2">Aucun compte configuré</h3>
          <p class="text-ui-content-muted text-sm italic mb-8">Commencez par ajouter votre premier compte bancaire ou livret d'épargne.</p>
          <UiButton @click="accountToEdit = null; showModal = true" variant="secondary">Créer mon premier compte</UiButton>
        </div>
    </div>

    <!-- Modal -->
    <DashboardAccountModal :show="showModal" :account="accountToEdit" @close="showModal = false" @success="fetchAccounts" />

    <!-- Modal de suppression -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer le compte ?</h3>
          </div>
        </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer le compte <span class="font-bold text-ui-content">{{ accountToDelete?.name }}</span> ? Cette action est irréversible.
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">
            Supprimer
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>