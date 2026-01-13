<script setup lang="ts">

const pb = usePocketBase()
const user = usePocketBaseUser()

const navItems = [
  { icon: 'lucide:layout-dashboard', label: 'Tableau de bord', to: '/dashboard' },
  { icon: 'lucide:wallet', label: 'Comptes', to: '/dashboard/accounts' },
  { icon: 'lucide:pie-chart', label: 'Budget', to: '/dashboard/budget' },
  { icon: 'lucide:rocket', label: 'Projet', to: '/dashboard/projects' },
  { icon: 'lucide:bar-chart-3', label: 'Analyses', to: '/dashboard/stats' },
  { icon: 'lucide:user', label: 'Profil', to: '/dashboard/profile' },
  { icon: 'lucide:settings', label: 'Paramètres', to: '/dashboard/settings' },
]

const showLogoutModal = ref(false)
const showLoadingModal = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('')

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const confirmLogout = async () => {
  showLogoutModal.value = false
  showLoadingModal.value = true
  
  loadingProgress.value = 0
  loadingStep.value = 'Fermeture de la session...'
  await sleep(500)

  loadingProgress.value = 60
  loadingStep.value = 'Nettoyage sécurisé...'
  pb.authStore.clear()
  user.value = null
  sessionStorage.removeItem('buddyair_session_active')
  localStorage.removeItem('buddyair_session_active')
  
  await sleep(400)
  loadingProgress.value = 100
  return navigateTo('/auth/login')
}
</script>

<template>
  <aside class="fixed left-0 top-0 h-full w-20 bg-ui-surface border-r border-ui-border flex flex-col items-center py-8 z-50 shadow-sm">
    <!-- Logo Icon -->
    <div class="flex items-center justify-center w-12 h-12 rounded-2xl bg-ui-surface-muted border border-ui-border shadow-sm hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-default group/logo">
      <span class="text-2xl font-black tracking-tighter bg-linear-to-br from-blue-400 to-pink-400 bg-clip-text text-transparent select-none italic">
        BA
      </span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 flex flex-col gap-2 pt-12">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.to"
        :to="item.to"
        class="relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 hover:bg-ui-surface-muted text-ui-content-muted hover:text-ui-content"
        exact-active-class="!text-blue-500 bg-ui-surface-muted shadow-sm"
      >
        <Icon :name="item.icon" class="w-6 h-6" />
        
        <!-- Tooltip -->
        <span class="absolute left-full ml-4 px-3 py-1.5 bg-ui-content text-ui-surface text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
          {{ item.label }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Bottom Actions -->
    <div class="flex flex-col gap-6 items-center">
      <ClientOnly>
      <NuxtLink 
        v-if="user?.role === 3"
        to="/admin"
        class="relative group flex items-center justify-center w-12 h-12 rounded-xl text-purple-600 hover:bg-purple-50 transition-all duration-300 cursor-pointer"
      >
        <Icon name="lucide:shield-check" class="w-6 h-6" />
        <span class="absolute left-full ml-4 px-3 py-1.5 bg-ui-content text-ui-surface text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
          Administration
        </span>
      </NuxtLink>
      </ClientOnly>

      <button 
        @click="showLogoutModal = true"
        class="relative group flex items-center justify-center w-12 h-12 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300 cursor-pointer"
      >
        <Icon name="lucide:log-out" class="w-6 h-6" />
        <span class="absolute left-full ml-4 px-3 py-1.5 bg-ui-content text-ui-surface text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
          Déconnexion
        </span>
      </button>
    </div>

    <!-- Modal de confirmation -->
    <DashboardLogoutModal 
      :show="showLogoutModal" 
      @close="showLogoutModal = false" 
      @confirm="confirmLogout" 
    />

    <!-- Modal de chargement (Déconnexion) -->
    <UiModal :show="showLoadingModal">
      <div class="bg-ui-surface border border-ui-border p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
        <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="lucide:plane-landing" class="w-8 h-8 text-red-500 animate-pulse" />
        </div>
        <h3 class="text-xl font-black text-ui-content mb-2">Déconnexion</h3>
        <p class="text-sm text-ui-content-muted mb-8 h-5">{{ loadingStep }}</p>
        <div class="h-2 bg-ui-surface-muted rounded-full overflow-hidden border border-ui-border">
          <div class="h-full bg-linear-to-r from-red-400 to-orange-400 transition-all duration-300 ease-out" :style="{ width: `${loadingProgress}%` }"></div>
        </div>
      </div>
    </UiModal>
  </aside>
</template>