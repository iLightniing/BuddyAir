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
    const data = await pb.collection('accounts').getFullList({ sort: '+order' })
    // On met à jour la liste gérée par FormKit
    accounts.value = data || []
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

const handleCardClick = (acc: any) => {
  if (!isEditMode.value) {
    navigateTo(`/dashboard/accounts/${acc.id}`)
  }
}
</script>
<template>
  <div class="space-y-6 min-h-[400px]">
    <!-- Loader -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
    </div>

    <div v-show="!loading" class="space-y-6">
        <!-- Barre d'actions -->
        <div class="flex justify-end items-center gap-3">
          <button disabled class="inline-flex items-center gap-2 px-4 py-2 bg-ui-surface-muted text-ui-content-muted/50 rounded-md border border-ui-border/50 cursor-not-allowed text-xs font-bold transition-all shadow-sm" title="Bientôt disponible">
            <Icon name="lucide:calendar-clock" class="w-4 h-4" />
            Échéancier
          </button>
          <button 
            v-if="accounts.length > 0"
            @click="isEditMode = !isEditMode"
            class="inline-flex items-center gap-2 px-4 py-2 bg-ui-surface hover:bg-ui-surface-muted rounded-md border border-ui-border text-xs font-bold transition-all shadow-sm cursor-pointer"
            :class="isEditMode ? 'bg-blue-50 border-blue-200 text-blue-600' : 'text-orange-500'"
          >
            <Icon :name="isEditMode ? 'lucide:check' : 'lucide:pencil'" class="w-4 h-4" />
            {{ isEditMode ? 'Terminer' : 'Modifier' }}
          </button>
          <button 
            @click="accountToEdit = null; showModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-ui-surface hover:bg-ui-surface-muted rounded-md border border-ui-border text-ui-content text-xs font-bold transition-all shadow-sm cursor-pointer group"
          >
            <Icon name="lucide:plus" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 text-blue-500" />
            Ajouter un compte
          </button>
        </div>

        <!-- Grille des comptes -->
        <!-- On utilise ref="parent" pour lier la zone de drop -->
        <div ref="parent" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="acc in accounts" 
            :key="acc.id"
            class="h-full"
          >
            <div 
              @click="handleCardClick(acc)"
              class="relative overflow-hidden p-6 rounded-2xl transition-all duration-300 group border h-full block"
              :class="[
                isEditMode ? 'shake-animation cursor-grab active:cursor-grabbing drag-handle' : 'hover:-translate-y-1 hover:shadow-xl cursor-pointer',
                'bg-ui-surface border-ui-border text-ui-content shadow-sm hover:border-blue-300/50'
              ]"
            >
            <!-- Background decoration -->
            <div class="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
              :class="acc.current_balance >= 0 ? 'bg-blue-400' : 'bg-red-400'"></div>
            
            <div class="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
              :class="acc.current_balance >= 0 ? 'bg-pink-400' : 'bg-orange-400'"></div>

            <!-- Card Content -->
            <div class="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
              <!-- Header -->
              <div class="flex justify-between items-start">
                <div class="flex flex-col gap-1">
                  <span class="text-[10px] font-black uppercase tracking-widest text-ui-content-muted">{{ acc.bank }}</span>
                  <div class="flex items-center gap-2 mt-1">
                    <Icon name="lucide:nfc" class="w-5 h-5 text-ui-content-muted/70" />
                    <Icon name="lucide:wifi" class="w-4 h-4 text-ui-content-muted/50 rotate-90" />
                  </div>
                </div>
                
                <!-- Actions (Edit Mode) or Icon (View Mode) -->
                <div v-if="isEditMode" class="flex gap-2">
                  <button @click.stop="handleEdit(acc)" class="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all hover:scale-110" title="Modifier">
                    <Icon name="lucide:pencil" class="w-4 h-4" />
                  </button>
                  <button @click.stop="handleDelete(acc)" class="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-50 transition-all hover:scale-110" title="Supprimer">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
                <div v-else class="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border"
                  :class="acc.current_balance >= 0 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-600'">
                  <Icon :name="acc.account_group === 'savings' ? 'lucide:piggy-bank' : 'lucide:credit-card'" class="w-5 h-5" />
                </div>
              </div>

              <!-- Balance -->
              <div class="mt-6">
                <p class="text-xs font-medium text-ui-content-muted mb-1">Solde actuel</p>
                <p class="text-3xl font-black tracking-tight tabular-nums text-ui-content" :class="acc.current_balance < 0 ? 'text-red-600' : ''">
                  {{ acc.current_balance.toLocaleString('fr-FR', { style: 'currency', currency: acc.currency }) }}
                </p>
              </div>

              <!-- Footer -->
              <div class="mt-4 pt-4 border-t border-ui-border flex justify-between items-center">
                <div class="flex flex-col min-w-0">
                  <h3 class="font-bold text-sm truncate text-ui-content">{{ acc.name }}</h3>
                  <span class="text-xs font-mono text-ui-content-muted tracking-wider">•••• {{ acc.id.substring(0, 4) }}</span>
                </div>
                <Icon v-if="!isEditMode" name="lucide:chevron-right" class="w-5 h-5 text-ui-content-muted group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div v-if="accounts.length === 0" class="relative bg-ui-surface border border-ui-border rounded-md p-12 text-center shadow-sm">
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

<style scoped>
@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
}
.shake-animation {
  animation: shake 0.3s infinite;
}
</style>