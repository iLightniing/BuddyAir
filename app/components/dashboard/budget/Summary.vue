<script setup lang="ts">
defineProps<{
  stats: any
  dailySafeSpend: number | null
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Total Budget -->
    <div class="bg-ui-surface border border-ui-border rounded-xl p-4 shadow-sm relative overflow-hidden group flex flex-col justify-between">
      <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon name="lucide:piggy-bank" class="w-16 h-16 text-blue-500" />
      </div>
      <p class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest mb-2">Budget Total</p>
      <p class="text-2xl font-black text-ui-content">{{ stats.totalLimit.toLocaleString('fr-FR') }} €</p>
      <div v-if="stats.totalIncome > 0" class="mt-2 text-[10px] font-medium text-ui-content-muted">
          {{ ((stats.totalLimit / stats.totalIncome) * 100).toFixed(0) }}% des revenus
          <span v-if="stats.savingsCapacity > 0" class="text-emerald-600 block">Épargne théorique: {{ stats.savingsCapacity.toLocaleString('fr-FR') }} €</span>
      </div>
      <div class="absolute top-4 right-4">
          <span class="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="[stats.health.bg, stats.health.color]">
            Santé {{ stats.health.label }}
          </span>
      </div>
    </div>

    <!-- Dépensé -->
    <div class="bg-ui-surface border border-ui-border rounded-xl p-4 shadow-sm relative overflow-hidden group flex flex-col justify-between">
      <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon name="lucide:trending-up" class="w-16 h-16 text-orange-500" />
      </div>
      <p class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest mb-2">Dépensé</p>
      <p class="text-2xl font-black text-ui-content">{{ stats.totalSpent.toLocaleString('fr-FR') }} €</p>
      <div class="mt-4 h-1.5 w-full bg-ui-surface-muted rounded-full overflow-hidden">
        <div class="h-full bg-blue-500 rounded-full transition-all duration-500" :style="{ width: `${Math.min(stats.progress, 100)}%` }"></div>
      </div>
      <div v-if="stats.totalScheduled > 0" class="mt-2 text-[10px] font-medium text-ui-content-muted">
          + {{ stats.totalScheduled.toLocaleString('fr-FR') }} € à venir (échéances)
      </div>
    </div>

    <!-- Restant -->
    <div class="bg-ui-surface border border-ui-border rounded-xl p-4 shadow-sm relative overflow-hidden group flex flex-col justify-between">
      <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon name="lucide:wallet" class="w-16 h-16 text-emerald-500" />
      </div>
      <p class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest mb-2">Reste à dépenser</p>
      <p class="text-2xl font-black" :class="stats.totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'">
        {{ stats.totalRemaining.toLocaleString('fr-FR') }} €
      </p>
      <p v-if="dailySafeSpend !== null && stats.totalRemaining > 0" class="text-xs text-ui-content-muted mt-1 font-medium">
        soit <span class="text-emerald-600 font-bold">{{ dailySafeSpend.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) }} €</span> / jour
      </p>
    </div>
  </div>
</template>