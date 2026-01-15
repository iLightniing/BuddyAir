<script setup lang="ts">
import { useAdminDashboard } from '~/composables/useAdminDashboard'

definePageMeta({
  layout: 'dashboard',
  title: 'Administration',
  middleware: ['admin']
})

const { stats, loading, fetchStats } = useAdminDashboard()

onMounted(fetchStats)
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-black text-ui-content tracking-tight">Pilotage de l'application</h1>
    
    <!-- Zone pour les futurs widgets -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-between relative overflow-hidden group">
          <div class="text-center">
            <p class="text-sm font-medium text-ui-content-muted mb-1">Utilisateurs</p>
            <p class="text-3xl font-black text-ui-content">{{ loading ? '...' : stats.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
             <Icon name="lucide:users" class="w-6 h-6" />
          </div>
       </div>
       <div class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-between">
          <div class="text-center">
            <p class="text-sm font-medium text-ui-content-muted mb-1">Premium</p>
            <p class="text-3xl font-black text-amber-600">{{ loading ? '...' : stats.premiumUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
             <Icon name="lucide:crown" class="w-6 h-6" />
          </div>
       </div>
       <div class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-between">
          <div class="text-center">
            <p class="text-sm font-medium text-ui-content-muted mb-1">Transactions</p>
            <p class="text-3xl font-black text-emerald-600">{{ loading ? '...' : stats.totalTransactions }}</p>
          </div>
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
             <Icon name="lucide:activity" class="w-6 h-6" />
          </div>
       </div>
    </div>

    <!-- Modules de gestion -->
    <div>
      <h2 class="text-lg font-bold text-ui-content mb-4">Modules de gestion</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink to="/admin/users" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:users" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Utilisateurs</h3>
          <p class="text-sm text-ui-content-muted">Gérer les comptes, les rôles et les accès.</p>
        </NuxtLink>

        <NuxtLink to="/admin/patchnotes" class="bg-ui-surface border border-ui-border rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all group cursor-pointer">
          <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon name="lucide:file-text" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Patchnotes</h3>
          <p class="text-sm text-ui-content-muted">Publier les nouveautés et mises à jour.</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>