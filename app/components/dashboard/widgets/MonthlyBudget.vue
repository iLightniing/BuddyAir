<script setup lang="ts">
const props = defineProps<{
  budget?: number
  spent: number
}>()

const budgetVal = computed(() => props.budget || 2000) // Valeur par défaut si non fournie
const percentage = computed(() => Math.min((props.spent / budgetVal.value) * 100, 100))
</script>

<template>
  <div class="flex items-center gap-3 min-w-[140px]">
    <div class="flex-1 h-2 bg-ui-surface-muted rounded-full overflow-hidden">
        <div class="h-full bg-purple-500 rounded-full" :style="{ width: `${percentage}%` }"></div>
    </div>
    <span class="text-xs font-bold text-ui-content whitespace-nowrap">{{ Math.round(percentage) }}%</span>
  </div>
</template>