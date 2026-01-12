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
            <DashboardAccountCard 
              :account="acc" 
              :is-edit-mode="isEditMode"
              @click="handleCardClick"
              @edit="handleEdit"
              @delete="handleDelete"
            />
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