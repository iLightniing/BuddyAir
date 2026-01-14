<script setup lang="ts">
definePageMeta({
  title: 'Tableau de bord'
})

const user = usePocketBaseUser()
const { 
  loading, totalBalance, accounts, recentTransactions, upcomingSchedules,
  fetchData, getTransactionIcon, getTransactionClass 
} = useDashboardData()

onMounted(fetchData)

// --- Quick Add Modal ---
const showQuickAddModal = ref(false)

// Helper pour formater les devises
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}

const getRelativeDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Demain"
  if (diffDays > 1 && diffDays <= 7) return `Dans ${diffDays} jours`
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(dateString))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ui-content">Vue d'ensemble</h1>
        <p class="text-ui-content-muted text-sm">Gérez vos finances efficacement.</p>
      </div>
      <div class="flex gap-3">
        <UiButton @click="showQuickAddModal = true" variant="primary" class="shadow-sm">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Transaction rapide
        </UiButton>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Balance -->
      <div class="bg-slate-800 dark:bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg shadow-slate-900/10 text-white relative overflow-hidden flex flex-col justify-center">
        <div class="absolute -top-10 -right-16 w-52 h-52 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-white/10 rounded-lg">
              <Icon name="lucide:wallet" class="w-5 h-5" />
            </div>
            <span class="text-sm font-medium text-slate-300">Solde Total</span>
          </div>
          <div class="text-3xl font-bold tracking-tight">
            {{ formatCurrency(totalBalance) }}
          </div>
        </div>
      </div>

      <!-- Active Accounts -->
      <div class="bg-ui-surface p-6 rounded-xl border border-ui-border shadow-sm flex flex-col justify-center">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Icon name="lucide:credit-card" class="w-5 h-5" />
          </div>
          <span class="text-sm font-medium text-ui-content-muted">Comptes Actifs</span>
        </div>
        <div class="text-3xl font-bold text-ui-content tracking-tight">
          {{ accounts.length }}
        </div>
      </div>

      <!-- Last Activity -->
      <div class="bg-ui-surface p-6 rounded-xl border border-ui-border shadow-sm flex flex-col justify-center">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Icon name="lucide:activity" class="w-5 h-5" />
          </div>
          <span class="text-sm font-medium text-ui-content-muted">Dernière activité</span>
        </div>
        <div class="text-lg font-bold text-ui-content tracking-tight truncate">
          <span v-if="recentTransactions.length">{{ new Date(recentTransactions[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) }}</span>
          <span v-else class="text-ui-content-muted text-base font-normal">Aucune</span>
        </div>
      </div>
    </div>

    <!-- Main Content Split -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- Accounts List -->
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

      <!-- Recent Transactions -->
      <div class="bg-ui-surface rounded-xl border border-ui-border shadow-sm flex flex-col">
        <div class="p-5 border-b border-ui-border flex justify-between items-center">
          <h3 class="font-bold text-ui-content">Transactions récentes</h3>
        </div>
        
        <div class="p-0">
          <div v-if="loading" class="p-8 text-center">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-ui-content-muted mx-auto" />
          </div>
          <div v-else-if="recentTransactions.length === 0" class="p-8 text-center text-ui-content-muted">
            Aucune transaction récente.
          </div>
          <div v-else class="divide-y divide-ui-border">
            <div v-for="tx in recentTransactions" :key="tx.id" class="p-4 hover:bg-ui-surface-muted/50 transition-colors flex items-center justify-between group">
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

      <!-- Upcoming Recurrences -->
      <div class="bg-ui-surface rounded-xl border border-ui-border shadow-sm flex flex-col h-fit">
        <div class="p-5 border-b border-ui-border flex justify-between items-center">
          <h3 class="font-bold text-ui-content flex items-center gap-2">
            <Icon name="lucide:calendar-clock" class="w-5 h-5 text-ui-content-muted" />
            Prochaines échéances
          </h3>
          <NuxtLink to="/dashboard/schedule" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Gérer</NuxtLink>
        </div>
        <div class="p-3">
          <div v-if="loading" class="p-4 text-center"><Icon name="lucide:loader-2" class="w-5 h-5 animate-spin text-ui-content-muted mx-auto" /></div>
          <div v-else-if="!upcomingSchedules || upcomingSchedules.length === 0" class="p-4 text-center text-ui-content-muted text-sm italic">Aucune échéance à venir.</div>
          <div v-else class="space-y-1">
            <div v-for="schedule in upcomingSchedules" :key="schedule.id" class="flex items-center justify-between p-2 rounded-lg hover:bg-ui-surface-muted/50">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getTransactionClass(schedule.type).replace('border', 'bg-opacity-10')">
                  <Icon :name="getTransactionIcon(schedule.type)" class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-medium text-ui-content text-sm truncate max-w-[120px]">{{ schedule.description }}</p>
                  <p class="text-xs text-ui-content-muted">{{ schedule.expand.account.name }}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="font-bold text-sm tabular-nums" :class="schedule.type === 'income' ? 'text-emerald-600' : 'text-ui-content'">
                  {{ schedule.type === 'income' ? '+' : '-' }}{{ formatCurrency(schedule.amount) }}
                </span>
                <p class="text-xs font-medium text-blue-500">{{ getRelativeDate(schedule.next_date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <DashboardQuickTransactionModal 
      :show="showQuickAddModal" 
      :accounts="accounts"
      @close="showQuickAddModal = false"
      @success="fetchData"
    />
  </div>
</template>