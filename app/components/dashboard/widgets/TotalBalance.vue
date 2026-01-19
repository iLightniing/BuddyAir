<script setup lang="ts">
defineProps<{
  totalCurrent: number
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2 mb-0.5">
        <Icon name="lucide:wallet" class="w-4 h-4 text-indigo-500" />
        <span class="text-ui-content-muted font-medium text-xs uppercase tracking-wider">Comptes</span>
    </div>
    <div>
      <p class="text-2xl font-black text-ui-content tracking-tight">{{ formatCurrency(totalCurrent) }}</p>
    </div>
  </div>
</template>