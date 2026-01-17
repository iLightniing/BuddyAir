<script setup lang="ts">
definePageMeta({
  title: 'Mes Comptes'
})

import { useAccounts } from '~/composables/useAccounts'
const { isPremium, openPremiumModal } = usePremium()

const {
  loading, isEditMode, isDragging,
  allAccounts, currentAccounts, savingsAccounts, creditAccounts, otherAccounts,
  showModal, accountToEdit, modalGroup,
  showDeleteModal, accountToDelete,
  fetchAccounts, handleCreate, handleEdit, handleDelete, confirmDelete, updateOrder
} = useAccounts()

const showCreateDropdown = ref(false)
const createDropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (showCreateDropdown.value && createDropdownRef.value && !createDropdownRef.value.contains(event.target as Node)) {
    showCreateDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const onDragStart = () => { isDragging.value = true }
const onDragEnd = () => { isDragging.value = false }
</script>
<template>
  <div class="space-y-6 min-h-[400px]">
    <!-- Loader -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
    </div>

    <div v-show="!loading" class="space-y-6">
        <!-- Barre d'actions -->
        <div class="flex flex-row justify-end items-center gap-3">
          <button 
            v-if="isPremium"
            @click="navigateTo('/dashboard/schedule')" 
            class="inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-bold transition-all shadow-sm cursor-pointer rounded-md hover:scale-105 active:scale-95" 
            title="Échéancier"
          >
            <Icon name="lucide:calendar-clock" class="w-5 h-5" />
            <span class="hidden sm:inline">Échéancier</span>
          </button>
          <button v-else @click="openPremiumModal" class="inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-700 text-sm font-bold transition-all shadow-sm cursor-pointer rounded-md hover:scale-105 active:scale-95 group" title="Fonctionnalité Premium">
            <Icon name="lucide:crown" class="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span class="hidden sm:inline">Échéancier</span>
          </button>
          <button 
            v-if="allAccounts.length > 0"
            @click="isEditMode = !isEditMode"
            class="inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-ui-surface hover:bg-ui-surface-muted rounded-md border border-ui-border text-sm font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            :class="isEditMode ? 'bg-blue-50 border-blue-200 text-blue-600' : 'text-orange-500'"
          >
            <Icon :name="isEditMode ? 'lucide:check' : 'lucide:pencil'" class="w-5 h-5" />
            <span class="hidden sm:inline">{{ isEditMode ? 'Terminer' : 'Modifier' }}</span>
          </button>
          
          <!-- Dropdown Ajouter -->
          <div class="relative" ref="createDropdownRef">
            <button 
              @click="showCreateDropdown = !showCreateDropdown"
              class="inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-ui-surface hover:bg-ui-surface-muted border border-ui-border text-emerald-600 rounded-md shadow-sm text-sm font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Icon name="lucide:plus" class="w-5 h-5" />
              <span class="hidden sm:inline">Ajouter</span>
            </button>
            
            <div v-if="showCreateDropdown" class="absolute right-0 top-full mt-2 w-56 bg-ui-surface border border-ui-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
              <button @click="handleCreate('current'); showCreateDropdown = false" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-ui-content hover:bg-ui-surface-muted rounded-lg text-left transition-colors">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Icon name="lucide:credit-card" class="w-4 h-4" /></div> Compte Courant
              </button>
              <button @click="handleCreate('savings'); showCreateDropdown = false" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-ui-content hover:bg-ui-surface-muted rounded-lg text-left transition-colors">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="lucide:piggy-bank" class="w-4 h-4" /></div> Épargne
              </button>
              <button @click="isPremium ? (handleCreate('credit'), showCreateDropdown = false) : (openPremiumModal(), showCreateDropdown = false)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-ui-content hover:bg-ui-surface-muted rounded-lg text-left transition-colors group">
                <div class="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><Icon name="lucide:landmark" class="w-4 h-4" /></div> <span class="flex-1">Crédit</span>
                <Icon v-if="!isPremium" name="lucide:lock" class="w-3 h-3 text-amber-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Vue Unifiée (Lecture & Édition) -->
        <div class="space-y-8">
          
          <DashboardAccountGroupList
            title="Comptes Courants"
            icon="lucide:credit-card"
            v-model:accounts="currentAccounts"
            :is-edit-mode="isEditMode"
            @edit="handleEdit"
            @delete="handleDelete"
            @update-order="updateOrder"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          />

          <DashboardAccountGroupList
            title="Épargne & Placements"
            icon="lucide:piggy-bank"
            v-model:accounts="savingsAccounts"
            :is-edit-mode="isEditMode"
            @edit="handleEdit"
            @delete="handleDelete"
            @update-order="updateOrder"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          />

          <DashboardAccountGroupList
            title="Crédits & Emprunts"
            icon="lucide:landmark"
            v-model:accounts="creditAccounts"
            :is-edit-mode="isEditMode"
            @edit="handleEdit"
            @delete="handleDelete"
            @update-order="updateOrder"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          />

          <DashboardAccountGroupList
            title="Autres"
            icon="lucide:wallet"
            v-model:accounts="otherAccounts"
            :is-edit-mode="isEditMode"
            @edit="handleEdit"
            @delete="handleDelete"
            @update-order="updateOrder"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          />

        <!-- État vide -->
        <div v-if="allAccounts.length === 0" class="relative bg-ui-surface border border-ui-border rounded-md p-6 sm:p-12 text-center shadow-sm">
          <div class="w-16 h-16 bg-ui-surface-muted rounded-2xl flex items-center justify-center mb-6 mx-auto text-ui-content-muted/20">
            <Icon name="lucide:wallet-minimal" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-black text-ui-content mb-2">Aucun compte configuré</h3>
          <p class="text-ui-content-muted text-sm italic mb-8">Commencez par ajouter votre premier compte bancaire ou livret d'épargne.</p>
          <UiButton @click="handleCreate('current')" variant="secondary">Créer mon premier compte</UiButton>
        </div>
    </div>

    <!-- Modal -->
    <DashboardAccountModal :show="showModal" :account="accountToEdit" :initial-group="modalGroup" @close="showModal = false" @success="fetchAccounts" />

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
  </div>
</template>
<style>
/* --- Amélioration du Drag & Drop --- */
/* L'élément fantôme (la place vide) */
.sortable-ghost {
  opacity: 0.2;
  transform: scale(0.95);
}

/* L'élément en cours de déplacement (sous le curseur) */
.sortable-drag {
  cursor: grabbing;
  opacity: 1 !important;
  z-index: 9999;
  transform: scale(1.05) rotate(2deg) !important; /* Force le scale et la rotation */
}

.sortable-drag .shake-animation {
  animation: none !important;
}
</style>