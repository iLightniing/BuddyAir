<script setup lang="ts">
defineProps<{
  goal: any
}>()
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative">
    <div class="flex justify-between items-start mb-3">
      <div class="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
        <Icon name="lucide:trophy" class="w-5 h-5" />
      </div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="emit('edit', goal)" class="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md"><Icon name="lucide:pencil" class="w-3.5 h-3.5" /></button>
        <button @click="emit('delete', goal)" class="p-1.5 hover:bg-red-50 text-red-600 rounded-md"><Icon name="lucide:trash-2" class="w-3.5 h-3.5" /></button>
      </div>
    </div>
    <h3 class="font-bold text-ui-content mb-1">{{ goal.name }}</h3>
    <div class="flex justify-between text-xs mb-2">
      <span class="font-bold text-purple-600">{{ goal.saved_amount.toLocaleString('fr-FR') }} €</span>
      <span class="text-ui-content-muted">sur {{ goal.target_amount.toLocaleString('fr-FR') }} €</span>
    </div>
    <div class="h-2 w-full bg-ui-surface-muted rounded-full overflow-hidden">
      <div class="h-full bg-purple-500 rounded-full transition-all duration-500" :style="{ width: `${Math.min((goal.saved_amount / goal.target_amount) * 100, 100)}%` }"></div>
    </div>
  </div>
</template>