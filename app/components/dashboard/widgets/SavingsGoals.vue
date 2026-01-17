<script setup lang="ts">
defineProps<{
  goals: { name: string, target: number, current: number, color: string }[]
}>()

const getPercentage = (current: number, target: number) => Math.min((current / target) * 100, 100)
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <h3 class="font-bold text-ui-content flex items-center gap-2">
        <div class="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
          <Icon name="lucide:target" class="w-4 h-4" />
        </div>
        Objectifs
      </h3>
      <button class="text-xs font-bold text-blue-600 hover:underline">Voir tout</button>
    </div>

    <div class="space-y-5">
      <div v-if="goals.length === 0" class="text-center py-4 text-ui-content-muted text-sm">
        Aucun compte épargne trouvé.
      </div>

      <div v-for="goal in goals" :key="goal.name">
        <div class="flex justify-between text-sm mb-1.5">
          <span class="font-medium text-ui-content">{{ goal.name }}</span>
          <span class="text-ui-content-muted">{{ Math.round(goal.current) }}€ / {{ goal.target }}€</span>
        </div>
        <div class="h-2.5 w-full bg-ui-surface-muted rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-1000 ease-out"
            :class="goal.color"
            :style="{ width: `${getPercentage(goal.current, goal.target)}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <button class="w-full mt-6 py-2 text-xs font-bold text-ui-content-muted border border-dashed border-ui-border rounded-xl hover:bg-ui-surface-muted hover:text-ui-content transition-colors flex items-center justify-center gap-2">
      <Icon name="lucide:plus" class="w-3 h-3" />
      Nouvel objectif
    </button>
  </div>
</template>