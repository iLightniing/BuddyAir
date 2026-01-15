<script setup lang="ts">
import { useSystemSettings } from '~/composables/useSystemSettings'

definePageMeta({
  layout: 'empty'
})

const { settings, fetchSettings } = useSystemSettings()

onMounted(fetchSettings)
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
    <div class="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-8 animate-pulse">
      <Icon name="lucide:construction" class="w-12 h-12" />
    </div>
    <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4">Maintenance en cours</h1>
    <p class="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
      {{ settings.maintenance_message || "Nous effectuons une maintenance. De retour bientôt !" }}
    </p>
    <div class="text-sm text-slate-400">
      Merci de votre patience.
    </div>
    
    <!-- Lien caché pour admin -->
    <NuxtLink to="/auth/login" class="mt-12 text-xs text-slate-300 hover:text-slate-500 transition-colors">
      Accès administrateur
    </NuxtLink>
  </div>
</template>