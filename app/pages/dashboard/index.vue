<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { navigateTo } from '#app'
import DashboardWidgetsTotalBalance from '~/components/dashboard/widgets/TotalBalance.vue'
import DashboardWidgetsRecentTransactions from '~/components/dashboard/widgets/RecentTransactions.vue'
import DashboardWidgetsUpcomingSchedules from '~/components/dashboard/widgets/UpcomingSchedules.vue'
import DashboardAccountAccountsList from '~/components/dashboard/widgets/AccountsList.vue'
import DashboardWidgetsMonthlyBudget from '~/components/dashboard/widgets/MonthlyBudget.vue'
import DashboardWidgetsSavingsGoals from '~/components/dashboard/widgets/SavingsGoals.vue'
import DashboardWidgetsCashFlow from '~/components/dashboard/widgets/CashFlow.vue'
import OnboardingWidget from '~/components/dashboard/onboarding/OnboardingWidget.vue'
import DashboardAccountModal from '~/components/dashboard/account/Modal.vue'

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

const showCreateAccountModal = ref(false)

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
    monthlyIncome.value = transactions.filter((t: any) => t.amount > 0).reduce((sum: number, t: any) => sum + t.amount, 0)
    monthlyExpense.value = transactions.filter((t: any) => t.amount < 0).reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
    
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
        <h1 class="text-2xl font-black text-ui-content tracking-tight">Tableau de bord</h1>
        <p class="text-ui-content-muted text-sm">Bienvenue, {{ user?.name || 'Utilisateur' }} !</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
    </div>

    <div v-else-if="showOnboarding" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <OnboardingWidget :completed-steps="completedOnboardingSteps" @action="handleOnboardingAction" />
    </div>

    <!-- UNE SEULE GRANDE CARTE -->
    <div v-else class="bg-ui-surface border border-ui-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <!-- En-tête : Solde Global (Pleine largeur) -->
        <div class="p-6 sm:p-8 border-b border-ui-border">
            <DashboardWidgetsTotalBalance 
                :total-current="totalCurrent" 
                :total-savings="totalSavings" 
                :total-credit="totalCredit" 
                class="!bg-transparent !border-0 !shadow-none !p-0 !text-ui-content"
            />
        </div>

        <!-- Contenu Principal (3 Colonnes) -->
        <div class="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-ui-border">
            
            <!-- Colonne Gauche (3/12) : Mes Comptes -->
            <div class="xl:col-span-3 p-6 flex flex-col gap-8 bg-ui-surface-muted/5">
                <div>
                    <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon name="lucide:wallet" class="w-3 h-3" /> Mes Comptes
                    </h3>
                    <DashboardAccountAccountsList 
                        :accounts="accounts" 
                        class="!bg-transparent !border-0 !shadow-none !p-0"
                    />
                </div>
                <div v-if="savingsGoals.length > 0">
                    <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon name="lucide:target" class="w-3 h-3" /> Objectifs
                    </h3>
                    <DashboardWidgetsSavingsGoals 
                        :goals="savingsGoals" 
                        class="!bg-transparent !border-0 !shadow-none !p-0"
                    />
                </div>
            </div>

            <!-- Colonne Centrale (6/12) : Activité -->
            <div class="xl:col-span-6 p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-bold text-ui-content flex items-center gap-2">
                        <Icon name="lucide:history" class="w-5 h-5 text-ui-content-muted" />
                        Activité récente
                    </h3>
                </div>
                <DashboardWidgetsRecentTransactions 
                    :transactions="recentTransactions" 
                    :loading="loading" 
                    class="!bg-transparent !border-0 !shadow-none !p-0"
                />
            </div>

            <!-- Colonne Droite (3/12) : Synthèse & Prévisions -->
            <div class="xl:col-span-3 p-6 flex flex-col gap-8 bg-ui-surface-muted/5">
                <!-- Stats -->
                <div class="space-y-6">
                    <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Icon name="lucide:bar-chart-3" class="w-3 h-3" /> Ce mois-ci
                    </h3>
                    <DashboardWidgetsCashFlow 
                        :income="monthlyIncome" 
                        :expenses="monthlyExpense" 
                        class="!bg-transparent !border-0 !shadow-none !p-0"
                    />
                    <DashboardWidgetsMonthlyBudget 
                        :spent="monthlyExpense" 
                        :budget="2000" 
                        class="!bg-transparent !border-0 !shadow-none !p-0"
                    />
                </div>

                <!-- Échéances -->
                <div>
                    <h3 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon name="lucide:calendar-clock" class="w-3 h-3" /> À venir
                    </h3>
                    <DashboardWidgetsUpcomingSchedules 
                        :schedules="upcomingSchedules" 
                        :loading="loading" 
                        class="!bg-transparent !border-0 !shadow-none !p-0"
                    />
                </div>
            </div>
        </div>
    </div>

    <DashboardAccountModal 
      :show="showCreateAccountModal" 
      @close="showCreateAccountModal = false" 
      @success="() => { showCreateAccountModal = false; fetchData(); }" 
    />
  </div>
</template>