<script setup lang="ts">
const props = defineProps<{
  income: number
  expenses: number
}>()
const balance = computed(() => props.income - props.expenses)
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <h3 class="font-bold text-ui-content flex items-center gap-2">
        <div class="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
          <Icon name="lucide:trending-up" class="w-4 h-4" />
        </div>
        Flux de Trésorerie
      </h3>
      <div class="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
        {{ balance > 0 ? '+' : '' }}{{ Math.round(balance) }} €
      </div>
    </div>

    <div class="flex-1 flex items-end gap-4 px-2">
      <!-- Barre Entrées -->
      <div class="flex-1 flex flex-col gap-2 group cursor-pointer">
        <div class="text-xs font-bold text-emerald-600 text-center opacity-0 group-hover:opacity-100 transition-opacity mb-auto">
          +{{ Math.round(income) }}€
        </div>
        <div class="w-full bg-emerald-100 rounded-t-xl relative overflow-hidden h-32">
           <div class="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-1000 ease-out rounded-t-xl" style="height: 80%"></div>
        </div>
        <p class="text-xs font-medium text-center text-ui-content-muted">Entrées</p>
      </div>

      <!-- Barre Sorties -->
      <div class="flex-1 flex flex-col gap-2 group cursor-pointer">
        <div class="text-xs font-bold text-red-600 text-center opacity-0 group-hover:opacity-100 transition-opacity mb-auto">
          -{{ Math.round(expenses) }}€
        </div>
        <div class="w-full bg-red-100 rounded-t-xl relative overflow-hidden h-32">
           <div class="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-1000 ease-out rounded-t-xl" style="height: 55%"></div>
        </div>
        <p class="text-xs font-medium text-center text-ui-content-muted">Sorties</p>
      </div>
    </div>
  </div>
</template>