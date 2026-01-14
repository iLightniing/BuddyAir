<script setup lang="ts">
/**
 * Configuration requise pour la collection PocketBase 'budgets' :
 * 
 * Champs :
 * - user : Relation (vers users, Max 1)
 * - category : Text
 * - amount : Number
 */
definePageMeta({ title: 'Budgets' })

import { VueDraggable } from 'vue-draggable-plus'
import { useBudgetManager } from '~/composables/useBudgetManager'

const {
  loading, currentDate, prevMonth, nextMonth, resetDate,
  globalStats, dailySafeSpend, isCurrentMonth, sortBy,
  orderedBudgets, updateOrder,
  showModal, editingBudget, showDeleteModal, budgetToDelete, showViewModal, viewingBudget, form,
  sortOptions, categoryOptions, viewingTransactions,
  openModal, openViewModal, saveBudget, deleteBudget, confirmDelete, init, currentMonthLabel
} = useBudgetManager()

onMounted(init)
</script>

<template>
  <div class="space-y-8">
    <!-- Header & Synthèse -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <!-- Sélecteur de mois -->
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-ui-surface border border-ui-border rounded-lg p-1 shadow-sm">
          <button @click="prevMonth" class="w-9 h-9 flex items-center justify-center hover:bg-ui-surface-muted rounded-md text-ui-content-muted hover:text-ui-content transition-colors">
            <Icon name="lucide:chevron-left" class="w-5 h-5" />
          </button>
          <span class="px-4 text-sm font-black text-ui-content capitalize min-w-[140px] text-center">{{ currentMonthLabel }}</span>
          <button @click="nextMonth" class="w-9 h-9 flex items-center justify-center hover:bg-ui-surface-muted rounded-md text-ui-content-muted hover:text-ui-content transition-colors">
            <Icon name="lucide:chevron-right" class="w-5 h-5" />
          </button>
        </div>
        <button v-if="!isCurrentMonth" @click="resetDate" class="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
          Aujourd'hui
        </button>
      </div>

      <div class="flex items-end gap-3">
        <UiButton @click="openModal()" class="shadow-lg shadow-blue-500/20 whitespace-nowrap h-[52px] flex items-center">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" /> Nouveau budget
        </UiButton>
      </div>
    </div>

    <!-- Cartes de synthèse -->
    <DashboardBudgetSummary :stats="globalStats" :daily-safe-spend="dailySafeSpend" />

    <!-- Grille des budgets -->
    <div v-if="loading" class="py-20 flex justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <VueDraggable v-else-if="orderedBudgets.length > 0"
      v-model="orderedBudgets"
      :animation="300"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      @end="updateOrder"
    >
      <div v-for="budget in orderedBudgets" :key="budget.id" class="cursor-grab active:cursor-grabbing">
        <DashboardBudgetCard 
          :budget="budget"
          @edit="openModal"
          @delete="deleteBudget"
          @view="openViewModal"
        />
      </div>
    </VueDraggable>

    <!-- État vide -->
    <DashboardEmptyState 
      v-else 
      icon="lucide:pie-chart" 
      title="Aucun budget défini" 
      message="Créez des budgets pour suivre vos dépenses par catégorie et maîtriser vos finances." 
    />

    <!-- Modal Création (Structure) -->
    <UiModal :show="showModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-ui-content">{{ editingBudget ? 'Modifier le budget' : 'Nouveau Budget' }}</h3>
          <button @click="showModal = false"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
        </div>
        <form class="space-y-4" @submit.prevent="saveBudget">
          <UiSelect v-model="form.category" label="Catégorie" :options="categoryOptions" placeholder="Sélectionner une catégorie" />
          <UiInput v-model="form.amount" label="Plafond mensuel" type="number" placeholder="0.00" />
          <div class="pt-4 flex gap-3">
            <UiButton type="button" @click="showModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
            <UiButton type="submit" class="flex-1">{{ editingBudget ? 'Enregistrer' : 'Créer' }}</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer le budget ?</h3>
        </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer le budget <span class="font-bold text-ui-content">{{ budgetToDelete?.category }}</span> ?
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>

    <!-- Modal Détails Transactions -->
    <UiModal :show="showViewModal">
      <div class="bg-ui-surface border border-ui-border p-0 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        <div class="p-5 border-b border-ui-border flex items-center justify-between bg-ui-surface-muted/30">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm bg-blue-500">
              <Icon :name="viewingBudget?.icon || 'lucide:wallet'" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-ui-content">{{ viewingBudget?.category }}</h3>
              <p class="text-xs text-ui-content-muted">{{ viewingTransactions.length }} opération(s) ce mois-ci</p>
            </div>
          </div>
          <button @click="showViewModal = false"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
        </div>

        <div class="overflow-y-auto p-0">
          <table class="w-full text-left text-sm">
            <tbody class="divide-y divide-ui-border">
              <tr v-for="tx in viewingTransactions" :key="tx.id" class="hover:bg-ui-surface-muted/50 transition-colors">
                <td class="px-5 py-4 text-ui-content-muted text-xs font-bold w-24">
                  {{ new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }}
                </td>
                <td class="px-5 py-4">
                  <div class="font-bold text-ui-content">{{ tx.description || 'Sans description' }}</div>
                  <div class="text-xs text-ui-content-muted mt-0.5">{{ tx.expand?.account?.name || 'Compte inconnu' }}</div>
                </td>
                <td class="px-5 py-4 text-right font-black text-red-600 tabular-nums">
                  -{{ Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} €
                </td>
              </tr>
              <tr v-if="viewingTransactions.length === 0">
                <td colspan="3" class="px-5 py-8 text-center text-ui-content-muted">Aucune dépense pour ce budget ce mois-ci.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="p-4 border-t border-ui-border bg-ui-surface-muted/30 flex justify-between items-center">
           <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider">Total dépensé</span>
           <span class="text-lg font-black text-red-600">{{ viewingBudget?.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
        </div>
      </div>
    </UiModal>
  </div>
</template>