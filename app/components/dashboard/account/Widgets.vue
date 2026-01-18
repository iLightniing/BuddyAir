<script setup lang="ts">
import { getLoanEndDate, getRemainingDuration } from '~/utils/account'
import { useAccountWidgets } from '~/composables/useAccountWidgets'

const props = defineProps<{
  account: any
  filteredTransactions: any[]
  balances: any
  creditAnalysis: any
}>()

const filterType = defineModel('filterType', { default: 'all' })
const searchQuery = defineModel('searchQuery', { default: '' })

const { monthlyStats, categoryStats, conicGradientStyle, savingsProjection } = useAccountWidgets(props)
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Widget 1: Résumé du mois -->
    <div class="bg-ui-surface border border-ui-border rounded-xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest flex items-center gap-2">
          <Icon name="lucide:activity" class="w-4 h-4" />
          Flux du mois
        </h3>
        <button v-if="filterType !== 'all'" @click="filterType = 'all'" class="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors" title="Réinitialiser le filtre">
          Voir tout
        </button>
      </div>
      
      <div class="space-y-2">
        <!-- Entrées (Interactif) -->
        <div 
          @click="filterType = filterType === 'income' ? 'all' : 'income'"
          class="group cursor-pointer p-2 -mx-2 rounded-lg transition-all border border-transparent"
          :class="filterType === 'income' ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'hover:bg-ui-surface-muted'"
        >
          <div class="flex justify-between items-end mb-1">
            <span class="text-sm font-medium text-ui-content-muted group-hover:text-ui-content transition-colors">{{ account.account_group === 'savings' ? 'Dépôts' : 'Entrées' }}</span>
            <span class="text-sm font-bold text-emerald-600">+{{ monthlyStats.income.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</span>
          </div>
          <div class="w-full bg-ui-surface-muted h-1.5 rounded-full overflow-hidden">
             <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" :style="{ width: `${Math.min((monthlyStats.income / (monthlyStats.income + monthlyStats.expense || 1)) * 100, 100)}%` }"></div>
          </div>
        </div>

        <!-- Sorties (Interactif) -->
        <div 
          @click="filterType = filterType === 'expense' ? 'all' : 'expense'"
          class="group cursor-pointer p-2 -mx-2 rounded-lg transition-all border border-transparent"
          :class="filterType === 'expense' ? 'bg-red-50/50 border-red-100 shadow-sm' : 'hover:bg-ui-surface-muted'"
        >
          <div class="flex justify-between items-end mb-1">
            <span class="text-sm font-medium text-ui-content-muted group-hover:text-ui-content transition-colors">{{ account.account_group === 'savings' ? 'Retraits' : 'Sorties' }}</span>
            <span class="text-sm font-bold text-red-600">-{{ monthlyStats.expense.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</span>
          </div>
          <div class="w-full bg-ui-surface-muted h-1.5 rounded-full overflow-hidden">
             <div class="h-full bg-red-500 rounded-full transition-all duration-500" :style="{ width: `${Math.min((monthlyStats.expense / (monthlyStats.income + monthlyStats.expense || 1)) * 100, 100)}%` }"></div>
          </div>
        </div>

        <div class="pt-3 mt-2 border-t border-ui-border">
           <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-ui-content">{{ account.account_group === 'savings' ? 'Variation nette' : 'Résultat' }}</span>
              <span v-if="monthlyStats.income > 0 && monthlyStats.balance > 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 mr-auto ml-2" title="Taux d'épargne">
                {{ ((monthlyStats.balance / monthlyStats.income) * 100).toFixed(0) }}%
              </span>
              <span class="text-sm font-black" :class="monthlyStats.balance >= 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ monthlyStats.balance > 0 ? '+' : '' }}{{ monthlyStats.balance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}
              </span>
           </div>
           
           <!-- Solde Prévu (Spécifique Compte Courant) -->
           <div v-if="account.account_group === 'current'" class="flex justify-between items-center mt-2 pt-2 border-t border-ui-border/50 border-dashed animate-in fade-in slide-in-from-top-1">
              <span class="text-[10px] font-medium text-ui-content-muted uppercase tracking-wide">Solde Prévu</span>
              <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {{ balances.projected.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}
              </span>
           </div>
        </div>
      </div>
    </div>

    <!-- Widget 2: Répartition Dépenses (Graphique + Liste) -->
    <div v-if="account.account_group === 'current' && categoryStats.length > 0" class="bg-ui-surface border border-ui-border rounded-xl p-5 shadow-sm md:col-span-2 flex flex-col md:flex-row gap-6">
      <!-- Graphique Donut -->
      <div class="flex flex-col items-center justify-center shrink-0">
         <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2 self-start md:self-center">
            <Icon name="lucide:pie-chart" class="w-4 h-4" />
            Répartition
         </h3>
         <div class="relative w-32 h-32 rounded-full shadow-inner" :style="{ background: conicGradientStyle }">
            <div class="absolute inset-4 bg-ui-surface rounded-full flex items-center justify-center shadow-sm">
               <span class="text-[10px] font-bold text-ui-content-muted uppercase tracking-wider">Dépenses</span>
            </div>
         </div>
      </div>

      <!-- Liste détaillée -->
      <div class="flex-1 space-y-3 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
        <div v-for="cat in categoryStats" :key="cat.label" 
             @click="searchQuery = cat.label"
             class="cursor-pointer group/cat flex items-center justify-between text-sm p-2 rounded-lg hover:bg-ui-surface-muted transition-colors"
             title="Filtrer par cette catégorie">
           <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-3 h-3 rounded-full shrink-0" :style="{ background: cat.color }"></div>
              <span class="font-medium text-ui-content truncate group-hover/cat:text-blue-600 transition-colors">{{ cat.label }}</span>
           </div>
           <div class="flex items-center gap-3 shrink-0">
              <span class="font-bold text-ui-content">{{ cat.value.toLocaleString('fr-FR', { style: 'currency', currency: account.currency, maximumFractionDigits: 0 }) }}</span>
              <span class="text-xs font-medium text-ui-content-muted w-8 text-right">{{ cat.percentage.toFixed(0) }}%</span>
           </div>
        </div>
      </div>
    </div>

    <!-- Widget 3: Projection Épargne (Seulement pour Épargne) -->
    <div v-if="account.account_group === 'savings'" class="bg-ui-surface border border-ui-border rounded-xl p-5 shadow-sm md:col-span-2">
       <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2">
        <Icon name="lucide:trending-up" class="w-4 h-4" />
        Projection des intérêts ({{ account.interest_rate }}%)
      </h3>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="proj in savingsProjection" :key="proj.year" class="bg-ui-surface-muted/30 rounded-lg p-3 border border-ui-border flex flex-col items-center text-center group hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
           <span class="text-[10px] font-bold text-ui-content-muted uppercase tracking-wider mb-1">{{ proj.year }} an{{ proj.year > 1 ? 's' : '' }}</span>
           <span class="text-sm font-black text-ui-content group-hover:text-emerald-700 transition-colors">
             {{ proj.total.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) }} €
           </span>
           <span class="text-[10px] font-bold text-emerald-600 mt-1 bg-emerald-100/50 px-1.5 py-0.5 rounded">
             +{{ proj.interest.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) }} €
           </span>
        </div>
      </div>
      
      <div class="mt-4 pt-3 border-t border-ui-border/50 text-[10px] text-ui-content-muted flex items-start gap-2">
        <Icon name="lucide:info" class="w-3 h-3 shrink-0 mt-0.5" />
        <p>
          Estimation basée sur le solde actuel avec intérêts composés annuels, sans nouveaux versements.
        </p>
      </div>
    </div>

    <!-- Widget 3: Analyse du Crédit -->
    <div v-if="account.account_group === 'credit' && creditAnalysis" class="bg-ui-surface border border-ui-border rounded-xl p-5 shadow-sm md:col-span-2">
       <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2">
        <Icon name="lucide:bar-chart-3" class="w-4 h-4" />
        Analyse du Crédit
      </h3>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between items-baseline mb-1">
            <span class="text-sm font-medium text-ui-content-muted">Coût total du crédit</span>
            <span class="text-lg font-black text-red-500">{{ creditAnalysis.totalCost.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</span>
          </div>
          <div class="w-full h-4 bg-ui-surface-muted rounded-full flex overflow-hidden shadow-inner group/bar">
            <div class="h-full bg-blue-500 transition-all duration-300 group-hover/bar:brightness-110" :style="{ width: `${creditAnalysis.capitalPercent}%` }" title="Capital"></div>
            <div class="h-full bg-orange-500 transition-all duration-300 group-hover/bar:brightness-110" :style="{ width: `${creditAnalysis.interestPercent}%` }" title="Intérêts"></div>
            <div class="h-full bg-purple-500 transition-all duration-300 group-hover/bar:brightness-110" :style="{ width: `${creditAnalysis.insurancePercent}%` }" title="Assurance"></div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 pt-2 text-center">
          <div>
            <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Capital</p>
            <p class="text-sm font-bold text-ui-content">{{ creditAnalysis.capital.toLocaleString('fr-FR', { style: 'currency', currency: account.currency, maximumFractionDigits: 0 }) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Intérêts</p>
            <p class="text-sm font-bold text-ui-content">{{ creditAnalysis.totalInterest.toLocaleString('fr-FR', { style: 'currency', currency: account.currency, maximumFractionDigits: 0 }) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Assurance</p>
            <p class="text-sm font-bold text-ui-content">{{ creditAnalysis.totalInsurance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency, maximumFractionDigits: 0 }) }}</p>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-ui-border/50 space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-ui-content-muted">Date de libération</span> <span class="font-bold">{{ getLoanEndDate(account) }}</span></div>
            <div class="flex justify-between"><span class="text-ui-content-muted">Durée restante</span> <span class="font-bold">{{ getRemainingDuration(account) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>