<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Administration',
  middleware: ['admin']
})
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-black text-ui-content tracking-tight">Pilotage de l'application</h1>
    
    <!-- Zone pour les futurs widgets -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <!-- Placeholder pour les stats -->
       <div class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-center text-ui-content-muted border-dashed">
          <div class="text-center">
            <Icon name="lucide:bar-chart-3" class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <span class="text-sm font-medium">Statistiques Globales</span>
          </div>
       </div>
       <div class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-center text-ui-content-muted border-dashed">
          <div class="text-center">
            <Icon name="lucide:crown" class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <span class="text-sm font-medium">Abonnements Premium</span>
          </div>
       </div>
       <div class="bg-ui-surface border border-ui-border rounded-xl p-6 h-32 flex items-center justify-center text-ui-content-muted border-dashed">
          <div class="text-center">
            <Icon name="lucide:coins" class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <span class="text-sm font-medium">Revenus</span>
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

        <div class="bg-ui-surface border border-ui-border rounded-xl p-6 opacity-50 border-dashed cursor-not-allowed">
          <div class="w-12 h-12 bg-ui-surface-muted text-ui-content-muted rounded-lg flex items-center justify-center mb-4">
            <Icon name="lucide:file-text" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-1">Patchnotes</h3>
          <p class="text-sm text-ui-content-muted">Bientôt disponible.</p>
        </div>
      </div>
    </div>
  </div>
</template>