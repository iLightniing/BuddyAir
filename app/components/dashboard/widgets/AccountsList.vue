<script setup lang="ts">
defineProps<{
  accounts: any[]
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>

<template>
  <div class="bg-ui-surface rounded-xl border border-ui-border shadow-sm flex flex-col h-fit">
    <div class="p-5 border-b border-ui-border flex justify-between items-center">
      <h3 class="font-bold text-ui-content">Mes Comptes</h3>
      <NuxtLink to="/dashboard/accounts" class="text-sm text-ui-content-muted hover:text-ui-content" title="Gérer les comptes">
        <Icon name="lucide:settings-2" class="w-4 h-4" />
      </NuxtLink>
    </div>
    <div class="p-4 space-y-3">
      <NuxtLink v-for="acc in accounts.slice(0, 5)" :key="acc.id" :to="`/dashboard/accounts/${acc.id}`" class="flex items-center justify-between p-3 rounded-lg border border-ui-border hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded bg-ui-surface-muted flex items-center justify-center text-ui-content-muted group-hover:text-blue-600 transition-colors">
            <Icon :name="acc.account_group === 'savings' ? 'lucide:piggy-bank' : 'lucide:wallet'" class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-ui-content truncate max-w-[100px]">{{ acc.name }}</span>
            <span class="text-[10px] text-ui-content-muted uppercase">{{ acc.account_group }}</span>
          </div>
        </div>
        <span class="text-sm font-bold text-ui-content tabular-nums">
          {{ formatCurrency(acc.current_balance) }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>