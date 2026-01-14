<script setup lang="ts">
defineProps<{
  totalCurrent: number
  totalSavings: number
  totalCredit: number
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>

<template>
  <div class="bg-slate-800 dark:bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-lg shadow-slate-900/10 text-white relative overflow-hidden flex flex-col justify-between">
    <div class="absolute -top-10 -right-16 w-52 h-52 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-1">
        <div class="p-1.5 bg-white/10 rounded-lg">
          <Icon name="lucide:wallet" class="w-4 h-4" />
        </div>
        <span class="text-xs font-medium text-slate-300 uppercase tracking-wider">Comptes Courants</span>
      </div>
      <div class="text-3xl font-black tracking-tight">
        {{ formatCurrency(totalCurrent) }}
      </div>
    </div>
    <div class="relative z-10 grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-white/10">
      <div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5"><Icon name="lucide:piggy-bank" class="w-3 h-3 text-emerald-400" /> Épargne</p>
        <p class="text-lg font-bold text-emerald-400 leading-none">{{ formatCurrency(totalSavings) }}</p>
      </div>
      <div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5"><Icon name="lucide:landmark" class="w-3 h-3 text-orange-400" /> Crédits</p>
        <p class="text-lg font-bold text-orange-400 leading-none">{{ formatCurrency(totalCredit) }}</p>
      </div>
    </div>
  </div>
</template>