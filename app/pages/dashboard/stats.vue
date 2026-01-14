<script setup lang="ts">
import { useFinancialStats } from '~/composables/useFinancialStats'

definePageMeta({ title: 'Statistiques' })

const {
  loading, currentMonthStats, historyData, historyLabels, cashFlowHistory, topExpenses, netWorth, pendingRecurring, safeToSpend, categoryData, trends,
  fetchData, conicGradientStyle, selectedAccountId, accounts
} = useFinancialStats()

onMounted(fetchData)

// --- Interactive Chart State ---
const hoveredIndex = ref<number | null>(null)

// Computed for chart scaling
const minHistory = computed(() => historyData.value.length ? Math.min(...historyData.value) * 0.95 : 0)
const maxHistory = computed(() => historyData.value.length ? Math.max(...historyData.value) * 1.05 : 100)
const rangeHistory = computed(() => maxHistory.value - minHistory.value || 1)

// --- Helpers SVG ---
const getY = (val: number, height: number) => {
  return height - ((val - minHistory.value) / rangeHistory.value) * height
}

const getPolylinePoints = (data: number[], width: number, height: number) => {
  if (data.length === 0) return ""
  
  return data.map((val, index) => {
    const x = (index / (data.length - 1)) * width
    const y = getY(val, height)
    return `${x},${y}`
  }).join(' ')
 }

 const getAreaPath = (data: number[], width: number, height: number) => {
    const polyline = getPolylinePoints(data, width, height)
    if (!polyline) return ""
    return `${polyline} L ${width},${height} L 0,${height} Z`
 }

 const getMaxCashFlow = computed(() => {
    return Math.max(...cashFlowHistory.value.map(d => Math.max(d.income, d.expense))) || 1
 })

const accountOptions = computed(() => {
  const options: any[] = [{ label: 'Global (Tous les comptes)', value: 'all' }]
  
  const groups: Record<string, string> = {
    current: 'Comptes Courants',
    savings: 'Épargne',
    credit: 'Crédits'
  }

  Object.entries(groups).forEach(([key, title]) => {
    const groupAccounts = accounts.value.filter(a => a.account_group === key)
    if (groupAccounts.length > 0) {
      options.push({ label: `── ${title} ──`, value: `grp_${key}`, disabled: true })
      groupAccounts.forEach(a => options.push({ label: a.name, value: a.id }))
    }
  })

  const otherAccounts = accounts.value.filter(a => !['current', 'savings', 'credit'].includes(a.account_group))
  if (otherAccounts.length > 0) {
    options.push({ label: '── Autres ──', value: 'grp_other', disabled: true })
    otherAccounts.forEach(a => options.push({ label: a.name, value: a.id }))
  }

  return options
})

const getTrendIcon = (value: number) => value > 0 ? 'lucide:trending-up' : (value < 0 ? 'lucide:trending-down' : 'lucide:minus')
const getTrendClass = (value: number, inverse = false) => {
  if (value === 0) return 'text-ui-content-muted bg-ui-surface-muted'
  return (value > 0 ? !inverse : inverse) ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header avec Sélecteur -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
       <div>
         <h1 class="text-2xl font-black text-ui-content tracking-tight">Vue d'ensemble</h1>
         <p class="text-sm text-ui-content-muted">Analysez la santé de vos finances.</p>
       </div>
       <div class="flex items-center gap-2 w-full sm:w-auto">
          <UiSelect v-model="selectedAccountId" :options="accountOptions" label="Compte" class="w-full sm:w-64" />
          <button class="p-2.5 hover:bg-ui-surface-muted rounded-lg border border-ui-border text-ui-content-muted hover:text-ui-content transition-colors" title="Exporter les données">
            <Icon name="lucide:download" class="w-5 h-5" />
          </button>
       </div>
    </div>

    <div v-if="loading" class="py-20 flex justify-center">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
    </div>

    <div v-else class="space-y-8">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
          <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-2">Revenus (Mois)</span>
          <div class="flex items-center justify-between">
             <span class="text-2xl font-black text-emerald-600">+{{ currentMonthStats.income.toLocaleString('fr-FR') }} €</span>
             <div class="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" :class="getTrendClass(trends.income)">
                <Icon :name="getTrendIcon(trends.income)" class="w-3 h-3" />
                {{ Math.abs(trends.income).toFixed(0) }}%
             </div>
          </div>
        </div>
        <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col">
          <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-2">Dépenses (Mois)</span>
          <div class="flex items-center justify-between">
             <span class="text-2xl font-black text-red-600">-{{ currentMonthStats.expense.toLocaleString('fr-FR') }} €</span>
             <div class="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" :class="getTrendClass(trends.expense, true)">
                <Icon :name="getTrendIcon(trends.expense)" class="w-3 h-3" />
                {{ Math.abs(trends.expense).toFixed(0) }}%
             </div>
          </div>
        </div>
        <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
          <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-2">Reste à vivre (Est.)</span>
          <div class="flex items-center gap-2">
             <span class="text-2xl font-black text-blue-600">{{ safeToSpend.toLocaleString('fr-FR') }} €</span>
             <Icon name="lucide:wallet" class="absolute right-4 bottom-4 w-12 h-12 text-ui-content-muted/10 group-hover:scale-110 transition-transform" />
          </div>
          <span v-if="pendingRecurring > 0" class="text-[10px] font-medium text-ui-content-muted mt-1">
            Dont {{ pendingRecurring.toLocaleString('fr-FR') }} € de charges prévues
          </span>
        </div>
        <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
          <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-2">{{ selectedAccountId === 'all' ? 'Patrimoine Net' : 'Solde Actuel' }}</span>
          <div class="flex items-center justify-between">
             <span class="text-2xl font-black" :class="netWorth >= 0 ? 'text-blue-600' : 'text-orange-500'">
                {{ netWorth.toLocaleString('fr-FR') }} €
             </span>
             <div class="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" :class="getTrendClass(trends.netWorth)">
                <Icon :name="getTrendIcon(trends.netWorth)" class="w-3 h-3" />
                {{ Math.abs(trends.netWorth).toFixed(0) }}%
             </div>
             <Icon name="lucide:landmark" class="absolute right-4 bottom-4 w-12 h-12 text-ui-content-muted/10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Graphique Évolution (Line Chart) -->
        <div class="lg:col-span-2 bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm">
          <h3 class="text-lg font-black text-ui-content mb-6 flex items-center gap-2">
             <Icon name="lucide:trending-up" class="w-5 h-5 text-blue-500" />
             {{ selectedAccountId === 'all' ? 'Évolution du patrimoine' : 'Évolution du solde' }}
          </h3>
          
          <div class="h-64 w-full relative group" @mouseleave="hoveredIndex = null">
             <!-- Tooltip -->
             <div v-if="hoveredIndex !== null && historyData[hoveredIndex] !== undefined" 
                  class="absolute z-10 bg-gray-900 text-white text-xs rounded py-1.5 px-3 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3 transition-all duration-75 shadow-xl"
                  :style="{ left: `${(hoveredIndex / (historyData.length - 1)) * 100}%`, top: `${getY(historyData[hoveredIndex] ?? 0, 100)}%` }"
             >
                <div class="font-bold whitespace-nowrap mb-0.5">{{ historyLabels[hoveredIndex] }}</div>
                <div class="font-mono text-emerald-300">{{ (historyData[hoveredIndex] ?? 0).toLocaleString('fr-FR') }} €</div>
             </div>

             <!-- SVG Chart -->
             <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <!-- Grille de fond -->
                <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />

                <!-- Zone Remplie -->
                <path 
                   :d="getAreaPath(historyData, 100, 100)" 
                   fill="url(#areaGradient)" 
                />

                <!-- Courbe -->
                <polyline 
                   :points="getPolylinePoints(historyData, 100, 100)" 
                   fill="none" 
                   stroke="#3b82f6" 
                   stroke-width="2" 
                   stroke-linecap="round" 
                   stroke-linejoin="round"
                   vector-effect="non-scaling-stroke"
                />
                
                <!-- Interactive Elements -->
                <g v-if="hoveredIndex !== null">
                   <line 
                      :x1="(hoveredIndex / (historyData.length - 1)) * 100" y1="0" 
                      :x2="(hoveredIndex / (historyData.length - 1)) * 100" y2="100" 
                      stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="2 2" 
                      vector-effect="non-scaling-stroke"
                   />
                   <circle 
                      :cx="(hoveredIndex / (historyData.length - 1)) * 100" 
                      :cy="getY(historyData[hoveredIndex] ?? 0, 100)" 
                      r="4" class="fill-blue-600 stroke-white stroke-2 shadow-sm"
                      vector-effect="non-scaling-stroke"
                   />
                </g>

                <!-- Hit Areas (Invisible bars for better hover UX) -->
                <rect v-for="(_, i) in historyData" 
                   :key="i"
                   :x="((i - 0.5) / (historyData.length - 1)) * 100" y="0"
                   :width="(1 / (historyData.length - 1)) * 100" height="100"
                   fill="transparent"
                   @mouseenter="hoveredIndex = i"
                   class="cursor-crosshair"
                />
             </svg>
             
             <!-- Labels Axe X -->
             <div class="flex justify-between mt-2 text-[10px] text-ui-content-muted font-bold uppercase tracking-wider">
                <span v-for="label in historyLabels" :key="label">{{ label }}</span>
             </div>
          </div>
        </div>

        <!-- Répartition (Donut Chart) -->
        <div class="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 class="text-lg font-black text-ui-content mb-6 flex items-center gap-2">
             <Icon name="lucide:pie-chart" class="w-5 h-5 text-purple-500" />
             Dépenses du mois
          </h3>

          <div class="flex-1 flex flex-col items-center justify-center">
             <!-- CSS Conic Gradient Donut -->
             <div class="relative w-48 h-48 rounded-full mb-8" :style="{ background: conicGradientStyle }">
                <!-- Trou du donut -->
                <div class="absolute inset-4 bg-ui-surface rounded-full flex flex-col items-center justify-center z-10">
                   <span class="text-xs text-ui-content-muted font-bold uppercase tracking-widest">Total</span>
                   <span class="text-xl font-black text-ui-content">{{ currentMonthStats.expense.toLocaleString('fr-FR') }} €</span>
                </div>
             </div>

             <!-- Légende -->
             <div class="w-full space-y-3">
                <div v-for="cat in categoryData" :key="cat.label" class="flex items-center justify-between text-sm">
                   <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" :style="{ background: cat.color }"></div>
                      <span class="font-medium text-ui-content">{{ cat.label }}</span>
                   </div>
                   <div class="flex items-center gap-3">
                      <span class="font-bold text-ui-content">{{ cat.value.toLocaleString() }} €</span>
                      <span class="text-xs text-ui-content-muted w-8 text-right">{{ cat.percentage.toFixed(0) }}%</span>
                   </div>
                </div>
                <div v-if="categoryData.length === 0" class="text-center text-ui-content-muted text-sm italic">
                   Aucune dépense ce mois-ci.
                </div>
             </div>
          </div>
        </div>

        <!-- Widget 3: Flux de Trésorerie (Cash Flow) -->
        <div class="lg:col-span-2 bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm">
           <h3 class="text-lg font-black text-ui-content mb-6 flex items-center gap-2">
             <Icon name="lucide:arrow-right-left" class="w-5 h-5 text-emerald-500" />
             Flux de trésorerie (6 mois)
           </h3>
           <div class="h-48 w-full flex items-end justify-between gap-2 sm:gap-4">
              <div v-for="(month, i) in cashFlowHistory" :key="i" class="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
                 <!-- Barres -->
                 <div class="w-full flex items-end justify-center gap-1 h-full">
                    <div class="w-3 sm:w-6 bg-emerald-400 rounded-t-sm transition-all duration-500 hover:bg-emerald-500 relative group/bar" :style="{ height: `${(month.income / getMaxCashFlow) * 100}%` }">
                       <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                          +{{ month.income.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) }}
                       </div>
                    </div>
                    <div class="w-3 sm:w-6 bg-red-400 rounded-t-sm transition-all duration-500 hover:bg-red-500 relative group/bar" :style="{ height: `${(month.expense / getMaxCashFlow) * 100}%` }">
                       <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                          -{{ month.expense.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) }}
                       </div>
                    </div>
                 </div>
                 <span class="text-[10px] text-ui-content-muted font-bold uppercase">{{ month.label }}</span>
              </div>
           </div>
        </div>

        <!-- Widget 4: Top Dépenses -->
        <div class="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
           <h3 class="text-lg font-black text-ui-content mb-6 flex items-center gap-2">
             <Icon name="lucide:trending-down" class="w-5 h-5 text-red-500" />
             Top Dépenses
           </h3>
           <div class="space-y-4 flex-1">
              <div v-for="tx in topExpenses" :key="tx.id" class="flex items-center justify-between group">
                 <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                       <Icon name="lucide:shopping-bag" class="w-4 h-4" />
                    </div>
                    <div class="min-w-0">
                       <p class="text-sm font-bold text-ui-content truncate">{{ tx.description }}</p>
                       <p class="text-[10px] text-ui-content-muted">{{ new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}</p>
                    </div>
                 </div>
                 <span class="text-sm font-black text-red-600 shrink-0">-{{ Math.abs(tx.amount).toLocaleString('fr-FR') }} €</span>
              </div>
              <div v-if="topExpenses.length === 0" class="text-center text-ui-content-muted text-sm italic py-4">
                 Aucune dépense majeure.
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation simple pour l'apparition */
circle { transition: r 0.2s ease; }
</style>