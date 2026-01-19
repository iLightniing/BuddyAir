<script setup lang="ts">
const props = defineProps<{
  income: number
  expenses: number
}>()
</script>

<template>
  <div class="flex items-center gap-2">
      <span class="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-xs">+{{ Math.round(income) }}€</span>
      <span class="text-ui-content-muted text-xs">/</span>
      <span class="font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs">-{{ Math.round(expenses) }}€</span>
  </div>
</template>