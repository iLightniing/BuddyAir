<script setup lang="ts">
import DashboardWidgetsTotalBalance from '~/components/dashboard/widgets/TotalBalance.vue'
import DashboardWidgetsLastVisit from '~/components/dashboard/widgets/LastVisit.vue'
import DashboardWidgetsSituation from '~/components/dashboard/widgets/Situation.vue'
import DashboardWidgetsRecentTransactions from '~/components/dashboard/widgets/RecentTransactions.vue'
import DashboardWidgetsUpcomingSchedules from '~/components/dashboard/widgets/UpcomingSchedules.vue'
import DashboardWidgetsAccountsList from '~/components/dashboard/widgets/AccountsList.vue'

definePageMeta({
  title: 'Tableau de bord'
})

const user = usePocketBaseUser()
const { 
  loading, accounts, recentTransactions, upcomingSchedules, fetchData,
  totalCurrent, totalSavings, totalCredit
} = useDashboardData()

// C'est ici que la magie opère : on lance le fetch à chaque fois que le composant est monté
onMounted(() => {
  fetchData()
})

// Sécurité supplémentaire : si l'utilisateur arrive tardivement (ex: refresh de page)
watch(user, (u) => {
  if (u && accounts.value.length === 0 && !loading.value) {
    fetchData()
  }
})

const showQuickAddModal = ref(false)

const lastActivityDate = computed(() => user.value?.updated)

</script>

<template>
  <div class="space-y-6">
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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardWidgetsTotalBalance :total-current="totalCurrent" :total-savings="totalSavings" :total-credit="totalCredit" />
      <DashboardWidgetsLastVisit :last-activity-date="lastActivityDate" />
      <DashboardWidgetsSituation :accounts="accounts" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <DashboardWidgetsAccountsList :accounts="accounts" />
      <DashboardWidgetsRecentTransactions :transactions="recentTransactions" :loading="loading" />
      <DashboardWidgetsUpcomingSchedules :schedules="upcomingSchedules" :loading="loading" />
    </div>

    <DashboardQuickTransactionModal 
      :show="showQuickAddModal" 
      :accounts="accounts"
      @close="showQuickAddModal = false"
      @success="fetchData"
    />
  </div>
</template>