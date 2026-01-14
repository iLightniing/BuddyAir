<script setup lang="ts">
defineProps<{
  transactions: any[]
  loading: boolean
}>()

const { getTransactionIcon, getTransactionClass } = useDashboardData()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>

<template>
  <div class="bg-ui-surface rounded-xl border border-ui-border shadow-sm flex flex-col">
    <div class="p-5 border-b border-ui-border flex justify-between items-center">
      <h3 class="font-bold text-ui-content">Transactions récentes</h3>
    </div>
    
    <div class="p-0">
      <div v-if="loading" class="p-8 text-center">
        <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-ui-content-muted mx-auto" />
      </div>
      <div v-else-if="transactions.length === 0" class="p-8 text-center text-ui-content-muted">
        Aucune transaction récente.
      </div>
      <div v-else class="divide-y divide-ui-border">
        <div v-for="tx in transactions" :key="tx.id" class="p-4 hover:bg-ui-surface-muted/50 transition-colors flex items-center justify-between group">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border bg-ui-surface" :class="getTransactionClass(tx.type)">
              <Icon :name="getTransactionIcon(tx.type)" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-ui-content text-sm">{{ tx.description || 'Sans description' }}</p>
              <p class="text-xs text-ui-content-muted flex items-center gap-1">
                {{ new Date(tx.date).toLocaleDateString('fr-FR') }}
                <span v-if="tx.expand?.account" class="w-1 h-1 rounded-full bg-ui-border"></span>
                {{ tx.expand?.account?.name }}
              </p>
            </div>
          </div>
          <span class="font-bold text-sm tabular-nums" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-ui-content'">
            {{ tx.type === 'income' ? '+' : '' }} {{ formatCurrency(tx.amount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>