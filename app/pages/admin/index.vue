<script setup lang="ts">
import { useAdminDashboard } from '~/composables/useAdminDashboard'
import AnalyticsModal from '~/components/admin/AnalyticsModal.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Administration',
  middleware: ['admin']
})

const { stats, loading, fetchStats } = useAdminDashboard()

// Gestion de la modale Analytics
const showAnalytics = ref(false)
const analyticsType = ref<'users' | 'premium' | 'transactions' | null>(null)

const openAnalytics = (type: 'users' | 'premium' | 'transactions') => {
  analyticsType.value = type
  showAnalytics.value = true
}

onMounted(fetchStats)
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-black text-ui-content tracking-tight">Pilotage de l'application</h1>
    
    <!-- Zone pour les futurs widgets -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <!-- Carte Utilisateurs -->
       <div 
         @click="openAnalytics('users')"
         class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-between relative overflow-hidden group animate-in zoom-in-50 duration-500 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
       >
          <div class="text-center">
            <p class="text-sm font-medium text-ui-content-muted mb-1">Utilisateurs</p>
            <p class="text-3xl font-black text-ui-content">{{ loading ? '...' : stats.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
             <Icon name="lucide:users" class="w-6 h-6" />
          </div>
          <!-- Indice visuel de clic -->
          <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-500 font-bold flex items-center">
            Détails <Icon name="lucide:arrow-right" class="w-3 h-3 ml-1" />
          </div>
       </div>

       <!-- Carte Premium -->
       <div 
         @click="openAnalytics('premium')"
         class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-between animate-in zoom-in-50 duration-500 delay-150 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
       >
          <div class="text-center">
            <p class="text-sm font-medium text-ui-content-muted mb-1">Premium</p>
            <p class="text-3xl font-black text-amber-600">{{ loading ? '...' : stats.premiumUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
             <Icon name="lucide:crown" class="w-6 h-6" />
          </div>
          <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-amber-600 font-bold flex items-center">
            Détails <Icon name="lucide:arrow-right" class="w-3 h-3 ml-1" />
          </div>
       </div>

       <!-- Carte Transactions -->
       <div 
         @click="openAnalytics('transactions')"
         class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-between animate-in zoom-in-50 duration-500 delay-300 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
       >
          <div class="text-center">
            <p class="text-sm font-medium text-ui-content-muted mb-1">Transactions</p>
            <p class="text-3xl font-black text-emerald-600">{{ loading ? '...' : stats.totalTransactions }}</p>
          </div>
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
             <Icon name="lucide:activity" class="w-6 h-6" />
          </div>
          <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-emerald-600 font-bold flex items-center">
            Détails <Icon name="lucide:arrow-right" class="w-3 h-3 ml-1" />
          </div>
       </div>
    </div>

    <!-- Modules de gestion -->
    <div>
      <h2 class="text-lg font-bold text-ui-content mb-4">Modules de gestion</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink to="/admin/announcements" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:megaphone" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Annonces</h3>
          <p class="text-sm text-ui-content-muted">Diffuser des messages aux utilisateurs.</p>
        </NuxtLink>

        <NuxtLink to="/admin/categories" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:tags" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Catégories</h3>
          <p class="text-sm text-ui-content-muted">Gérer les catégories globales du système.</p>
        </NuxtLink>

        <NuxtLink to="/admin/logs" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:scroll-text" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Logs Système</h3>
          <p class="text-sm text-ui-content-muted">Consulter les erreurs et activités.</p>
        </NuxtLink>

        <NuxtLink to="/admin/payment-methods" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:credit-card" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Modes de paiement</h3>
          <p class="text-sm text-ui-content-muted">Gérer les moyens de paiement globaux.</p>
        </NuxtLink>

        <NuxtLink to="/admin/patchnotes" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:file-text" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Patchnotes</h3>
          <p class="text-sm text-ui-content-muted">Publier les nouveautés et mises à jour.</p>
        </NuxtLink>

        <NuxtLink to="/admin/settings" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-slate-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:settings" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Système</h3>
          <p class="text-sm text-ui-content-muted">Maintenance et configuration globale.</p>
        </NuxtLink>

        <NuxtLink to="/admin/support" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-pink-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:life-buoy" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Support</h3>
          <p class="text-sm text-ui-content-muted">Gérer les tickets et demandes utilisateurs.</p>
        </NuxtLink>

        <NuxtLink to="/admin/users" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:users" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Utilisateurs</h3>
          <p class="text-sm text-ui-content-muted">Gérer les comptes, les rôles et les accès.</p>
        </NuxtLink>
      </div>
    </div>

    <!-- Modale Analytics -->
    <AnalyticsModal 
      :show="showAnalytics" 
      :type="analyticsType" 
      @close="showAnalytics = false" 
    />
  </div>
</template>