<script setup lang="ts">
import { ref } from 'vue'

const supabase = useSupabaseClient()

const navItems = [
  { icon: 'lucide:layout-dashboard', label: 'Tableau de bord', to: '/dashboard' },
  { icon: 'lucide:wallet', label: 'Comptes', to: '/dashboard/accounts' },
  { icon: 'lucide:pie-chart', label: 'Budget', to: '/dashboard/budget' },
  { icon: 'lucide:rocket', label: 'Projet', to: '/dashboard/projects' },
  { icon: 'lucide:settings', label: 'Paramètres', to: '/dashboard/settings' },
]

const showLogoutModal = ref(false)

const confirmLogout = async () => {
  await supabase.auth.signOut()
  sessionStorage.removeItem('buddyair_session_active')
  showLogoutModal.value = false
  return navigateTo('/auth/login', { replace: true })
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
      <button 
        @click="showLogoutModal = true"
        class="flex items-center justify-center w-12 h-12 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300 cursor-pointer"
      >
        <Icon name="lucide:log-out" class="w-6 h-6" />
      </button>
    </div>

    <!-- Modal de confirmation -->
    <DashboardLogoutModal 
      :show="showLogoutModal" 
      @close="showLogoutModal = false" 
      @confirm="confirmLogout" 
    />
  </aside>
</template>