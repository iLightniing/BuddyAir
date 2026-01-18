<script setup lang="ts">
import DashboardWidgetsTotalBalance from '~/components/dashboard/widgets/TotalBalance.vue'
import DashboardWidgetsLastVisit from '~/components/dashboard/widgets/LastVisit.vue'
import DashboardWidgetsSituation from '~/components/dashboard/widgets/Situation.vue'
import DashboardWidgetsRecentTransactions from '~/components/dashboard/widgets/RecentTransactions.vue'
import DashboardWidgetsUpcomingSchedules from '~/components/dashboard/widgets/UpcomingSchedules.vue'
import DashboardAccountAccountsList from '~/components/dashboard/widgets/AccountsList.vue'
import DashboardWidgetsMonthlyBudget from '~/components/dashboard/widgets/MonthlyBudget.vue'
import DashboardWidgetsSavingsGoals from '~/components/dashboard/widgets/SavingsGoals.vue'
import DashboardWidgetsCashFlow from '~/components/dashboard/widgets/CashFlow.vue'
import OnboardingWidget from '~/components/dashboard/onboarding/OnboardingWidget.vue'
import WidgetStoreModal from '~/components/dashboard/modals/WidgetStoreModal.vue'
import DashboardAccountModal from '~/components/dashboard/account/Modal.vue'
import { VueDraggable } from 'vue-draggable-plus'

definePageMeta({
  title: 'Tableau de bord'
})

const user = usePocketBaseUser()
const pb = usePocketBase()
const { 
  loading, accounts, recentTransactions, upcomingSchedules, fetchData,
  totalCurrent, totalSavings, totalCredit
} = useDashboardData()

// On force le chargement par défaut pour éviter le flash de l'onboarding
loading.value = true

// C'est ici que la magie opère : on lance le fetch à chaque fois que le composant est monté
onMounted(() => {
  fetchData()
  fetchMonthlyStats()
})

// Sécurité supplémentaire : si l'utilisateur arrive tardivement (ex: refresh de page)
watch(user, (u) => {
  if (u && accounts.value.length === 0 && !loading.value) {
    fetchData()
    fetchMonthlyStats()
  }
})

const showWidgetStore = ref(false)
const showCreateAccountModal = ref(false)
const widgetColumns = ref<any[]>([[], [], []]) // 3 colonnes

const lastActivityDate = computed(() => user.value?.updated)

const completedOnboardingSteps = computed(() => {
  const steps: string[] = []
  if (accounts.value.length > 0) steps.push('create-account')
  if (recentTransactions.value.length > 0) {
    steps.push('create-transaction')
  }
  return steps
})

const showOnboarding = computed(() => accounts.value.length === 0 || recentTransactions.value.length === 0)

// --- Données Calculées pour les Widgets ---
const monthlyIncome = ref(0)
const monthlyExpense = ref(0)

const fetchMonthlyStats = async () => {
  if (!user.value) return
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  try {
    // On récupère toutes les transactions du mois en cours
    const transactions = await pb.collection('transactions').getFullList({
      filter: `user = "${user.value.id}" && date >= "${startOfMonth}"`,
      fields: 'amount'
    })
    
    // Calcul des totaux
    monthlyIncome.value = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    monthlyExpense.value = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
  } catch (e) {
    console.error("Erreur stats mensuelles:", e)
  }
}

// Transformation des comptes épargne en "Objectifs"
const savingsGoals = computed(() => {
  return accounts.value
    .filter(acc => acc.account_group === 'savings')
    .map(acc => ({
      name: acc.name,
      current: acc.current_balance,
      target: (acc as any).target || 10000, // Valeur par défaut si pas de cible définie
      color: 'bg-emerald-500'
    }))
})

const sanitizeWidgets = () => {
  const seen = new Set()
  widgetColumns.value.forEach(col => {
    for (let i = col.length - 1; i >= 0; i--) {
      const wId = col[i]
      if (!wId || typeof wId !== 'string' || seen.has(wId)) {
        col.splice(i, 1)
      } else {
        seen.add(wId)
      }
    }
  })
}

onMounted(() => {
  const saved = localStorage.getItem('buddyair_dashboard_widgets')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      
      // Migration : Si c'est l'ancien format (tableau plat), on distribue dans les colonnes
      if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === 'string' || (typeof parsed[0] === 'object' && !Array.isArray(parsed[0])))) {
        const flat = typeof parsed[0] === 'object' ? parsed.map((w: any) => w.id) : parsed
        // Distribution équitable
        flat.forEach((w: string, i: number) => {
          widgetColumns.value[i % 3]?.push(w)
        })
      } else {
        // Format correct (tableau de tableaux)
        widgetColumns.value = parsed
      }
    } catch (e) {
      widgetColumns.value = [[], [], []]
    }
    sanitizeWidgets()
  }
})

watch(widgetColumns, () => {
  localStorage.setItem('buddyair_dashboard_widgets', JSON.stringify(widgetColumns.value))
}, { deep: true })

const flatWidgets = computed(() => widgetColumns.value.flat())

const updateWidgets = (newWidgets: string[]) => {
  const currentFlat = flatWidgets.value
  
  // Widgets supprimés
  widgetColumns.value.forEach(col => {
    for (let i = col.length - 1; i >= 0; i--) {
      const wId = col[i]
      if (wId && !newWidgets.includes(wId)) {
        col.splice(i, 1)
      }
    }
  })

  // Widgets ajoutés (on ajoute dans la colonne la plus courte)
  newWidgets.filter(w => !currentFlat.includes(w)).forEach(w => {
    const shortestCol = widgetColumns.value.reduce((prev, curr) => prev.length <= curr.length ? prev : curr)
    shortestCol.push(w)
  })
  sanitizeWidgets()
}

const fillDefaults = async () => {
  widgetColumns.value = [[], [], []]
  
  const defaults = [
    { col: 0, id: 'TotalBalance' },
    { col: 1, id: 'RecentTransactions' },
    { col: 2, id: 'Situation' },
    { col: 0, id: 'MonthlyBudget' },
    { col: 1, id: 'SavingsGoals' },
    { col: 2, id: 'UpcomingSchedules' }
  ]

  for (const w of defaults) {
    widgetColumns.value[w.col].push(w.id)
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  sanitizeWidgets()
}

const handleOnboardingAction = (action: string) => {
  if (action === 'create-transaction') {
    if (accounts.value.length > 0) {
      navigateTo(`/dashboard/accounts/${accounts.value[0]?.id}`)
    } else {
      showCreateAccountModal.value = true
    }
  } else if (action === 'create-account') {
    showCreateAccountModal.value = true
  }
}

</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ui-content">Vue d'ensemble</h1>
        <p class="text-ui-content-muted text-sm">Gérez vos finances efficacement.</p>
      </div>
      <div class="flex gap-3">
        <UiButton v-if="!showOnboarding" @click="showWidgetStore = true" variant="primary" class="shadow-sm">
          <Icon name="lucide:layout-grid" class="w-4 h-4 mr-2" />
          Ajouter Widget
        </UiButton>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
    </div>

    <div v-else-if="showOnboarding" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <OnboardingWidget :completed-steps="completedOnboardingSteps" @action="handleOnboardingAction" />
    </div>

    <!-- Zone "Aucun widget" -->
    <div v-else-if="flatWidgets.length === 0" class="py-16 text-center bg-ui-surface border border-ui-border border-dashed rounded-2xl">
       <div class="w-16 h-16 bg-ui-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:layout-dashboard" class="w-8 h-8 text-ui-content-muted" />
       </div>
       <h3 class="text-lg font-bold text-ui-content mb-1">Aucun widget paramétré</h3>
       <p class="text-ui-content-muted mb-6">Personnalisez votre tableau de bord pour afficher les informations qui vous importent.</p>
       <div class="flex flex-wrap gap-3 justify-center">
         <UiButton @click="showWidgetStore = true" variant="outline">
            Choisir mes widgets
         </UiButton>
         <UiButton @click="fillDefaults" variant="secondary">
            Générer un tableau de bord type
         </UiButton>
       </div>
    </div>

    <!-- Colonnes de Widgets (Masonry) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      <div v-for="(col, colIndex) in widgetColumns" :key="colIndex" class="flex flex-col gap-6">
        <VueDraggable 
          v-model="widgetColumns[colIndex]" 
          group="dashboard-widgets"
          class="flex flex-col gap-6 min-h-[100px]"
          :animation="150"
          handle=".widget-handle"
        >
            <div v-for="widgetId in col" :key="widgetId" class="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <DashboardWidgetsTotalBalance v-if="widgetId === 'TotalBalance'" :total-current="totalCurrent" :total-savings="totalSavings" :total-credit="totalCredit" class="widget-handle cursor-move" />
                <DashboardWidgetsLastVisit v-else-if="widgetId === 'LastVisit'" :last-activity-date="lastActivityDate" class="widget-handle cursor-move" />
                <DashboardWidgetsSituation v-else-if="widgetId === 'Situation'" :accounts="accounts" class="widget-handle cursor-move" />
                <DashboardAccountAccountsList v-else-if="widgetId === 'AccountsList'" :accounts="accounts" class="widget-handle cursor-move" />
                <DashboardWidgetsRecentTransactions v-else-if="widgetId === 'RecentTransactions'" :transactions="recentTransactions" :loading="loading" class="widget-handle cursor-move" />
                <DashboardWidgetsUpcomingSchedules v-else-if="widgetId === 'UpcomingSchedules'" :schedules="upcomingSchedules" :loading="loading" class="widget-handle cursor-move" />
                <DashboardWidgetsMonthlyBudget v-else-if="widgetId === 'MonthlyBudget'" :spent="monthlyExpense" :budget="2000" class="widget-handle cursor-move" />
                <DashboardWidgetsSavingsGoals v-else-if="widgetId === 'SavingsGoals'" :goals="savingsGoals" class="widget-handle cursor-move" />
                <DashboardWidgetsCashFlow v-else-if="widgetId === 'CashFlow'" :income="monthlyIncome" :expenses="monthlyExpense" class="widget-handle cursor-move" />
            </div>
        </VueDraggable>
      </div>
    </div>

    <WidgetStoreModal 
      :show="showWidgetStore"
      :active-widgets="flatWidgets"
      @close="showWidgetStore = false"
      @update:widgets="updateWidgets"
    />

    <DashboardAccountModal 
      :show="showCreateAccountModal" 
      @close="showCreateAccountModal = false" 
      @success="() => { showCreateAccountModal = false; fetchData(); }" 
    />
  </div>
</template>