<script setup lang="ts">
const props = defineProps<{
  budget: any
}>()

const emit = defineEmits(['edit', 'delete', 'view'])

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 85) return 'bg-orange-500'
  return 'bg-emerald-500'
}
</script>

<template>
  <div 
    class="bg-ui-surface border border-ui-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
    :class="{ 'border-red-200 bg-red-50/10': budget.percentage > 100, 'border-orange-200 bg-orange-50/10': budget.percentage <= 100 && budget.projectedPercentage > 100 }"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md bg-blue-500">
          <Icon :name="budget.icon" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-bold text-ui-content">{{ budget.category }}</h3>
          <div class="flex items-center gap-2 mt-0.5">
            <p class="text-xs text-ui-content-muted font-medium">{{ budget.percentage.toFixed(0) }}% utilisé</p>
            <span v-if="budget.pace" class="text-[10px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wide" :class="budget.pace.class">
              {{ budget.pace.label }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="emit('view', budget)" class="p-1.5 hover:bg-purple-50 text-purple-600 rounded-md transition-colors" title="Voir le détail">
          <Icon name="lucide:list" class="w-3.5 h-3.5" />
        </button>
        <button @click="emit('edit', budget)" class="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors">
          <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
        </button>
        <button @click="emit('delete', budget)" class="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex justify-between text-sm font-bold">
        <span class="text-ui-content">{{ budget.spent.toLocaleString('fr-FR') }} €</span>
        <span class="text-ui-content-muted">sur {{ budget.amount.toLocaleString('fr-FR') }} €</span>
      </div>
      <div class="h-2.5 w-full bg-ui-surface-muted rounded-full overflow-hidden relative">
        <!-- Bar projeté (Echéances à venir) -->
        <div 
          class="h-full rounded-full absolute left-0 top-0 z-0 opacity-30 transition-all duration-500" 
          :class="getProgressColor(budget.projectedPercentage)"
          :style="{ width: `${Math.min(budget.projectedPercentage, 100)}%` }"
        ></div>
        <!-- Bar réel -->
        <div 
          class="h-full rounded-full absolute left-0 top-0 z-10 transition-all duration-500" 
          :class="getProgressColor(budget.percentage)"
          :style="{ width: `${Math.min(budget.percentage, 100)}%` }"
        ></div>
      </div>
      <div class="text-right">
        <span v-if="budget.remaining < 0" class="text-xs font-bold text-red-600">
          Dépassement de {{ Math.abs(budget.remaining).toLocaleString('fr-FR') }} €
        </span>
        <span v-else class="text-xs font-bold text-emerald-600">
          Reste {{ budget.remaining.toLocaleString('fr-FR') }} €
        </span>
        <div v-if="budget.remainingPerDay > 0" class="text-[10px] text-blue-600 font-bold mt-0.5">
           ~ {{ budget.remainingPerDay.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) }} € / jour
        </div>
        <div v-if="budget.scheduled > 0" class="text-[10px] text-ui-content-muted mt-0.5 font-medium">
            dont {{ budget.scheduled.toLocaleString('fr-FR') }} € prévus
        </div>
      </div>
      
      <!-- Tendance vs Mois dernier -->
      <div class="pt-3 mt-3 border-t border-ui-border/50 flex justify-between items-center text-[10px] font-medium">
          <span class="text-ui-content-muted">Vs mois dernier</span>
          <div class="flex items-center gap-1">
            <span v-if="budget.trend > 0" class="text-red-500 flex items-center font-bold"><Icon name="lucide:trending-up" class="w-3 h-3 mr-1" /> +{{ budget.trend.toLocaleString('fr-FR') }} €</span>
            <span v-else-if="budget.trend < 0" class="text-emerald-600 flex items-center font-bold"><Icon name="lucide:trending-down" class="w-3 h-3 mr-1" /> {{ budget.trend.toLocaleString('fr-FR') }} €</span>
            <span v-else class="text-ui-content-muted">= Identique</span>
          </div>
      </div>
    </div>
  </div>
</template>