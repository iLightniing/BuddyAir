<script setup lang="ts">
definePageMeta({ title: 'Analyses Financières' })

const pb = usePocketBase()
const user = usePocketBaseUser()
const loading = ref(true)

// Données
const currentMonthStats = ref({ income: 0, expense: 0, savingsRate: 0 })
const historyData = ref<number[]>([])
const historyLabels = ref<string[]>([])
const categoryData = ref<{ label: string, value: number, color: string, percentage: number }[]>([])

// Couleurs pour les catégories
const chartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4']

const fetchData = async () => {
  if (!user.value) return
  loading.value = true
  
  try {
    const now = new Date()
    
    // 1. Récupérer toutes les transactions (pour l'historique et les stats)
    // Idéalement, on filtrerait sur les X derniers mois côté serveur, mais pour l'exemple on prend tout et on filtre en JS
    const transactions = await pb.collection('transactions').getFullList({
      filter: `user = "${user.value.id}"`,
      sort: '-date',
      requestKey: null
    })

    // --- Stats du mois en cours ---
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthTx = transactions.filter(t => new Date(t.date) >= startOfMonth)
    
    const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    currentMonthStats.value = {
      income,
      expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    }

    // --- Répartition par catégorie (Mois en cours) ---
    const expensesByCategory: Record<string, number> = {}
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Autre'
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Math.abs(t.amount)
    })

    const sortedCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6) // Top 6 catégories

    const totalCategorized = sortedCategories.reduce((sum, [, val]) => sum + val, 0)
    
    categoryData.value = sortedCategories.map(([label, value], index) => ({
      label,
      value,
      color: chartColors[index % chartColors.length] || '#cccccc',
      percentage: expense > 0 ? (value / expense) * 100 : 0
    }))

    // --- Historique des soldes (6 derniers mois) ---
    // On reconstruit l'historique en partant du solde actuel des comptes
    const accounts = await pb.collection('accounts').getFullList({ 
      filter: `user = "${user.value.id}"`,
      requestKey: null
    })
    let currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0)
    
    const months = []
    const balances = []
    
    // On itère sur les 6 derniers mois
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('fr-FR', { month: 'short' })
      
      // Pour le mois en cours (i=0), c'est le solde actuel
      // Pour les mois précédents, on inverse les transactions du mois suivant
      if (i > 0) {
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() - i + 2, 0) // Fin du mois suivant
        
        // On cherche les transactions qui ont eu lieu ENTRE la fin de ce mois historique et aujourd'hui
        // Simplification : On prend les transactions du mois M+1 pour remonter le solde
        const txInNextMonth = transactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate >= nextMonthStart && tDate < new Date(now.getFullYear(), now.getMonth() - i + 2, 1)
        })

        // Si c'était une dépense, on l'ajoute au solde (car on remonte le temps). Si revenu, on retire.
        txInNextMonth.forEach(t => {
          if (t.type === 'expense') currentTotalBalance += Math.abs(t.amount)
          else currentTotalBalance -= t.amount
        })
      }
      
      months.unshift(label)
      balances.unshift(currentTotalBalance)
    }
    
    historyLabels.value = months
    historyData.value = balances

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// --- Helpers SVG ---
const getPolylinePoints = (data: number[], width: number, height: number) => {
  if (data.length === 0) return ""
  const min = Math.min(...data) * 0.95
  const max = Math.max(...data) * 1.05
  const range = max - min || 1
  
  return data.map((val, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')
}

const getDonutPath = (index: number, total: number) => {
  // Calcul simplifié pour des segments de donut (nécessiterait plus de maths pour un vrai donut SVG dynamique, 
  // ici on utilise une astuce CSS conic-gradient pour la simplicité et la robustesse)
  return '' 
}

const conicGradientStyle = computed(() => {
  let currentAngle = 0
  const segments = categoryData.value.map(cat => {
    const start = currentAngle
    const end = currentAngle + cat.percentage
    currentAngle = end
    return `${cat.color} ${start}% ${end}%`
  })
  // Fond gris si vide
  if (segments.length === 0) return 'conic-gradient(#f1f5f9 0% 100%)'
  return `conic-gradient(${segments.join(', ')})`
})
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="py-20 flex justify-center">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
    </div>

    <div v-else class="space-y-8">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col">
          <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-2">Revenus (Mois)</span>
          <span class="text-2xl font-black text-emerald-600">+{{ currentMonthStats.income.toLocaleString('fr-FR') }} €</span>
        </div>
        <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col">
          <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-2">Dépenses (Mois)</span>
          <span class="text-2xl font-black text-red-600">-{{ currentMonthStats.expense.toLocaleString('fr-FR') }} €</span>
        </div>
        <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm flex flex-col">
          <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-2">Taux d'épargne</span>
          <div class="flex items-center gap-2">
             <span class="text-2xl font-black" :class="currentMonthStats.savingsRate > 0 ? 'text-blue-600' : 'text-orange-500'">
                {{ currentMonthStats.savingsRate.toFixed(1) }}%
             </span>
             <span v-if="currentMonthStats.savingsRate > 20" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Excellent</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Graphique Évolution (Line Chart) -->
        <div class="lg:col-span-2 bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm">
          <h3 class="text-lg font-black text-ui-content mb-6 flex items-center gap-2">
             <Icon name="lucide:trending-up" class="w-5 h-5 text-blue-500" />
             Évolution du patrimoine
          </h3>
          
          <div class="h-64 w-full relative">
             <!-- SVG Chart -->
             <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <!-- Grille de fond -->
                <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" stroke-opacity="0.05" stroke-width="0.5" />

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
                
                <!-- Points -->
                <circle 
                   v-for="(val, i) in historyData" 
                   :key="i"
                   :cx="(i / (historyData.length - 1)) * 100" 
                   :cy="100 - ((val - Math.min(...historyData)*0.95) / (Math.max(...historyData)*1.05 - Math.min(...historyData)*0.95 || 1)) * 100" 
                   r="1.5" 
                   class="fill-white stroke-blue-500 stroke-2 hover:r-2 transition-all cursor-pointer"
                   vector-effect="non-scaling-stroke"
                >
                   <title>{{ historyLabels[i] }}: {{ val.toLocaleString() }} €</title>
                </circle>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation simple pour l'apparition */
circle { transition: r 0.2s ease; }
</style>