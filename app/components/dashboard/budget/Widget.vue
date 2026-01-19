<script setup lang="ts">
const pb = usePocketBase()
const user = usePocketBaseUser()

const loading = ref(true)
const totalBudget = ref(0)
const totalSpent = ref(0)

onMounted(async () => {
  if (!user.value) return
  try {
    // 1. Récupérer tous les budgets
    const budgets = await pb.collection('budgets').getFullList({
       filter: `user = "${user.value.id}"`,
       requestKey: null
    })
    
    if (budgets.length === 0) {
      loading.value = false
      return
    }

    totalBudget.value = budgets.reduce((acc, b) => acc + b.amount, 0)
    const budgetCategories = budgets.map(b => b.category)
    
    // 2. Récupérer les dépenses du mois en cours pour ces catégories
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
    
    const transactions = await pb.collection('transactions').getFullList({
       filter: `user = "${user.value.id}" && date >= "${start}" && date <= "${end}" && type = "expense"`,
       requestKey: null,
       expand: 'category'
    })
    
    // On ne compte que les dépenses qui ont une catégorie budgétisée
    const relevantTransactions = transactions.filter(t => {
        // Récupération robuste du nom de la catégorie (comme sur le dashboard)
        let txCatName = ''
        if (t.expand?.category) {
             const catObj = Array.isArray(t.expand.category) ? t.expand.category[0] : t.expand.category
             txCatName = catObj.name || catObj.label || ''
        }
        const catName = txCatName || t.category || ''
        return budgetCategories.some(bc => bc.trim().toLowerCase() === catName.trim().toLowerCase())
    })
    totalSpent.value = relevantTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0)
    
  } catch (e) {
    console.error("Erreur widget budget", e)
  } finally {
    loading.value = false
  }
})

const progress = computed(() => totalBudget.value > 0 ? (totalSpent.value / totalBudget.value) * 100 : 0)
const remaining = computed(() => totalBudget.value - totalSpent.value)

const getProgressColor = (p: number) => {
  if (p >= 100) return 'bg-red-500'
  if (p >= 85) return 'bg-orange-500'
  return 'bg-emerald-500'
}
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-full">
     <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-ui-content flex items-center gap-2">
           <Icon name="lucide:pie-chart" class="w-5 h-5 text-ui-content-muted" />
           Budget Mensuel
        </h3>
        <NuxtLink to="/dashboard/budget" class="text-xs font-bold text-blue-600 hover:underline">Gérer</NuxtLink>
     </div>
     
     <div v-if="loading" class="animate-pulse space-y-4">
        <div class="h-8 bg-ui-surface-muted rounded w-1/2"></div>
        <div class="h-2 bg-ui-surface-muted rounded-full"></div>
     </div>
     
     <div v-else>
        <div class="flex items-end justify-between mb-3">
           <div>
              <p class="text-3xl font-black text-ui-content tracking-tight">{{ totalSpent.toLocaleString('fr-FR') }} €</p>
              <p class="text-xs text-ui-content-muted font-medium mt-1">dépensés sur {{ totalBudget.toLocaleString('fr-FR') }} €</p>
           </div>
        </div>
        
        <div class="h-3 w-full bg-ui-surface-muted rounded-full overflow-hidden">
           <div 
              class="h-full rounded-full transition-all duration-1000 ease-out" 
              :class="getProgressColor(progress)"
              :style="{ width: `${Math.min(progress, 100)}%` }"
           ></div>
        </div>
     </div>
  </div>
</template>