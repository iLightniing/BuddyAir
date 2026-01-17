<script setup lang="ts">
const props = defineProps<{
  budget?: number
  spent: number
}>()

const budgetVal = computed(() => props.budget || 2000) // Valeur par défaut si non fournie
const percentage = computed(() => Math.min((props.spent / budgetVal.value) * 100, 100))
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-ui-content flex items-center gap-2">
        <div class="p-1.5 bg-pink-100 text-pink-600 rounded-lg">
          <Icon name="lucide:piggy-bank" class="w-4 h-4" />
        </div>
        Budget Mensuel
      </h3>
      <span class="text-xs font-medium text-ui-content-muted">Février</span>
    </div>

    <div class="flex-1 flex flex-col justify-center items-center relative py-4">
      <!-- Jauge Circulaire SVG -->
      <div class="relative w-32 h-32">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <!-- Cercle de fond -->
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" class="text-ui-surface-muted" />
          <!-- Cercle de progression -->
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" class="text-pink-500 transition-all duration-1000 ease-out"
            :stroke-dasharray="251.2"
            :stroke-dashoffset="251.2 - (251.2 * percentage) / 100"
            stroke-linecap="round"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl font-black text-ui-content">{{ Math.round(percentage) }}%</span>
          <span class="text-[10px] text-ui-content-muted uppercase font-bold">Utilisé</span>
        </div>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2 text-center">
      <div class="p-2 rounded-xl bg-ui-surface-muted/50">
        <p class="text-xs text-ui-content-muted mb-1">Dépensé</p>
        <p class="font-bold text-pink-600">{{ Math.round(spent) }} €</p>
      </div>
      <div class="p-2 rounded-xl bg-ui-surface-muted/50">
        <p class="text-xs text-ui-content-muted mb-1">Restant</p>
        <p class="font-bold text-emerald-600">{{ Math.round(budgetVal - spent) }} €</p>
      </div>
    </div>
  </div>
</template>