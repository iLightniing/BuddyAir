<script setup lang="ts">
definePageMeta({
  title: 'Détails du compte'
})

import { useAccountDetail } from '~/composables/useAccountDetail'
import { useTransactionActions } from '~/composables/useTransactionActions'

const route = useRoute()
const accountId = route.params.id as string

const { 
  loading, account, transactions, pendingTransactions, futureTransactions, selectedTransactions, 
  currentDate, searchQuery, fetchData, prevMonth, nextMonth,
  filterType, filterStatus, filteredTransactions, balances 
} = useAccountDetail(accountId)

const {
  showTransactionModal, transactionToEdit, transactionToDuplicate, showDeleteModal, transactionToDelete,
  handleEdit, handleDuplicate, confirmDelete, handleDelete, togglePointed,
  handleBulkPoint, handleBulkDelete, handleExport, handleExportJSON
} = useTransactionActions(accountId, account, transactions, pendingTransactions, filteredTransactions, selectedTransactions, currentDate, fetchData)

const showAmortizationModal = ref(false)

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

// Helpers pour l'affichage spécifique
const getLoanEndDate = (acc: any) => {
  if (!acc.loan_start_date || !acc.loan_duration) return 'Inconnue'
  const end = new Date(acc.loan_start_date)
  end.setMonth(end.getMonth() + acc.loan_duration)
  return end.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

const calculateYearlyInterest = (acc: any) => {
  return (acc.current_balance * (acc.interest_rate / 100)).toLocaleString('fr-FR', { style: 'currency', currency: acc.currency })
}

// Calculs pour le graphique Crédit (Capital vs Intérêts payés)
// Note: C'est une estimation simplifiée basée sur l'avancement
const getCreditProgress = (acc: any) => {
  if (!acc.credit_amount || !acc.current_balance) return { capital: 0, interest: 0 }
  const totalPaid = acc.credit_amount - Math.abs(acc.current_balance)
  // Estimation : Au début on paie surtout des intérêts. Ratio simplifié pour l'exemple.
  // Pour un vrai calcul, il faudrait l'historique d'amortissement.
  const progress = totalPaid / acc.credit_amount
  return { capital: progress * 100, interest: 0 } // Simplifié pour l'instant
}
</script>

<template>
  <div class="space-y-4">
    <DashboardAccountToolbar 
      :account="account"
      :selected-transactions="selectedTransactions"
      :current-month-label="currentMonthLabel"
      :balances="balances"
      :show-balances="!['credit', 'savings'].includes(account?.account_group)"
      v-model:search-query="searchQuery"
      v-model:filter-type="filterType"
      v-model:filter-status="filterStatus"
      @add="handleEdit(null)"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @show-amortization="showAmortizationModal = true"
      @bulk-point="handleBulkPoint"
      @bulk-delete="handleBulkDelete"
      @export="handleExport"
      @export-json="handleExportJSON"
    >
      <template #metrics>
        <!-- HEADER SPÉCIFIQUE : CRÉDIT (Intégré dans la toolbar) -->
        <div v-if="account?.account_group === 'credit'" class="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
           <!-- Card 1: Capital Restant -->
           <div class="flex flex-col items-end min-w-[140px]">
              <p class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest mb-0.5">Capital Restant</p>
              <p class="text-lg font-black text-red-600 leading-none">{{ account.current_balance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</p>
              <div class="w-full bg-ui-surface-muted h-1 rounded-full mt-1.5 overflow-hidden">
                 <div class="h-full flex rounded-full overflow-hidden">
                    <!-- Partie remboursée -->
                    <div class="h-full bg-emerald-500" :style="{ width: `${100 - (Math.abs(account.current_balance) / account.credit_amount) * 100}%` }"></div>
                 </div>
              </div>
           </div>

           <div class="w-px h-8 bg-ui-border mx-2"></div>

           <!-- Card 2: Mensualité -->
           <div class="flex flex-col items-end">
              <p class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest mb-0.5">Mensualité</p>
              <div class="flex items-baseline gap-1">
                 <p class="text-lg font-black text-ui-content leading-none">{{ Number(account.monthly_payment).toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</p>
                 <span class="text-[9px] text-ui-content-muted">/mois</span>
              </div>
              <span class="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1">Fin : {{ getLoanEndDate(account) }}</span>
           </div>

           <div class="w-px h-8 bg-ui-border mx-2"></div>

           <!-- Card 3: Taux -->
           <div class="flex flex-col items-end">
              <p class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest mb-0.5">Taux</p>
              <div class="flex items-center gap-2">
                 <span class="text-lg font-black text-orange-600 leading-none">{{ account.interest_rate }}%</span>
              </div>
              <button @click="showAmortizationModal = true" class="text-[9px] font-bold text-blue-600 hover:underline mt-1">Tableau</button>
           </div>
        </div>
        
        <!-- Bouton d'ajout rapide pour Crédit (Optionnel, si on veut un bouton spécifique dans la zone metrics) -->
        <!-- Mais le bouton "+" principal de la toolbar fait déjà le job. -->
        <!-- On laisse comme ça pour l'instant. -->

        <!-- HEADER SPÉCIFIQUE : ÉPARGNE (Intégré dans la toolbar) -->
        <div v-else-if="account?.account_group === 'savings'" class="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
           <!-- Card 1: Solde -->
           <div class="flex flex-col items-end">
              <p class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest mb-0.5">Disponible</p>
              <p class="text-lg font-black text-emerald-600 leading-none">{{ account.current_balance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</p>
           </div>

           <div class="w-px h-8 bg-ui-border mx-2"></div>

           <!-- Card 2: Performance -->
           <div class="flex flex-col items-end">
              <p class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest mb-0.5">Intérêts (Est.)</p>
              <div class="flex items-baseline gap-1">
                 <span class="text-lg font-black text-ui-content leading-none">+{{ calculateYearlyInterest(account) }}</span>
                 <span class="text-[9px] text-ui-content-muted">/an</span>
              </div>
              <div class="flex items-center gap-1 mt-1">
                 <span class="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">{{ account.interest_rate }}%</span>
              </div>
           </div>
        </div>
      </template>
    </DashboardAccountToolbar>

    <!-- Liste des transactions -->
    <DashboardTransactionTable 
      v-if="account"
      :transactions="filteredTransactions"
      :loading="loading"
      v-model:selected-transactions="selectedTransactions"
      :currency="account.currency"
      :account-group="account.account_group"
      @edit="handleEdit"
      @delete="confirmDelete"
      @duplicate="handleDuplicate"
      @toggle-pointed="togglePointed"
    />

    <!-- Modale Transaction -->
    <DashboardTransactionModal 
      :show="showTransactionModal" 
      :transaction="transactionToEdit" 
      :initial-data="transactionToDuplicate"
      :account-id="accountId"
      :account-group="account?.account_group"
      @close="showTransactionModal = false" 
      @delete="confirmDelete"
      @success="fetchData" 
    />

    <!-- Modal de suppression -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer l'opération ?</h3>
       </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer cette transaction de <span class="font-bold text-ui-content">{{ transactionToDelete?.amount }} €</span> ?
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="handleDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>

    <!-- Modal Amortissement -->
    <DashboardAmortizationModal :show="showAmortizationModal" :account="account" @close="showAmortizationModal = false" />
  </div>  
</template>