<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { navigateTo } from '#app'
import DashboardWidgetsRecentTransactions from '~/components/dashboard/widgets/RecentTransactions.vue'
import DashboardWidgetsUpcomingSchedules from '~/components/dashboard/widgets/UpcomingSchedules.vue'
import DashboardAccountAccountsList from '~/components/dashboard/widgets/AccountsList.vue'
import OnboardingWidget from '~/components/dashboard/onboarding/OnboardingWidget.vue'
import DashboardAccountModal from '~/components/dashboard/account/Modal.vue'

definePageMeta({
  title: 'Tableau de bord'
})

const user = usePocketBaseUser()
const pb = usePocketBase()
const { 
  loading, accounts, recentTransactions, upcomingSchedules, fetchData
} = useDashboardData()
const { openPremiumModal } = usePremium()

// On force le chargement par défaut pour éviter le flash de l'onboarding
loading.value = true

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

// --- Cycle de vie (Déplacé après les fonctions pour garantir leur existence) ---
onMounted(() => {
  if (user.value) {
    fetchData()
  }
})

watch(user, (u) => {
  if (u) {
    // On recharge toujours les stats et projets, même si les comptes sont déjà là
    if (accounts.value.length === 0) fetchData()
  }
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
        
        <!-- Contenu Principal (3 Colonnes) -->
        <div class="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-ui-border">
            
            <!-- Colonne Gauche (3/12) : Mes Comptes -->
            <div class="xl:col-span-3 p-4 flex flex-col gap-8 bg-ui-surface-muted/5">
                <div>
                    <DashboardAccountAccountsList 
                        :accounts="accounts" 
                        class="!bg-transparent !border-0 !shadow-none !p-0"
                    />
                </div>
            </div>

            <!-- Colonne Centrale (6/12) : Activité -->
            <div class="xl:col-span-6 p-4">
                <DashboardWidgetsRecentTransactions 
                    :transactions="recentTransactions" 
                    :loading="loading" 
                    class="!bg-transparent !border-0 !shadow-none !p-0"
                />
            </div>

            <!-- Colonne Droite (3/12) : Échéances -->
            <div class="xl:col-span-3 p-4 flex flex-col gap-8 bg-ui-surface-muted/5">
                <!-- Échéances -->
                <div>
                    <div v-if="user?.role === 1" class="text-center py-6 space-y-3 bg-ui-surface border border-ui-border rounded-xl p-4 shadow-sm">
                        <div class="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <Icon name="lucide:crown" class="w-5 h-5" />
                        </div>
                        <div>
                            <h4 class="font-bold text-ui-content text-sm">Échéances</h4>
                            <p class="text-xs text-ui-content-muted mt-0.5">Réservé aux membres Premium.</p>
                        </div>
                        <UiButton @click="openPremiumModal" size="sm" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 border-none text-white shadow-lg shadow-amber-500/20 text-xs h-8">
                            S'abonner
                        </UiButton>
                    </div>
                    <DashboardWidgetsUpcomingSchedules 
                        v-else-if="user"
                        :schedules="upcomingSchedules.slice(0, 5)" 
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