<script setup lang="ts">
import { useSystemSettings } from '~/composables/useSystemSettings'

definePageMeta({
  layout: 'empty'
})

const { settings, fetchSettings } = useSystemSettings()

const loading = ref(true)
const timeLeft = ref('')

const updateCountdown = () => {
    if (!settings.value.maintenance_end) {
        timeLeft.value = ''
        return
    }
    const end = new Date(settings.value.maintenance_end).getTime()
    const now = new Date().getTime()
    const diff = end - now

    if (diff <= 0) {
        timeLeft.value = "Bientôt terminé..."
        return
    }

    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((diff % (1000 * 60)) / 1000)

    timeLeft.value = `${h}h ${m}m ${s}s`
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
    fetchSettings().then(() => { updateCountdown(); loading.value = false })
    timer = setInterval(updateCountdown, 1000)
})

// On surveille l'arrivée des données pour mettre à jour immédiatement
watch(() => settings.value.maintenance_end, updateCountdown, { immediate: true })

onUnmounted(() => clearInterval(timer))
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
    <div v-if="!loading && (timeLeft || settings.maintenance_end)" class="text-sm text-slate-400">
      Retour estimé dans : <br>
      <span class="text-2xl font-mono font-bold text-slate-700 dark:text-slate-300 mt-2 block">
          {{ timeLeft || '...' }}
      </span>
    </div>
    <div v-else-if="!loading" class="text-sm text-slate-400 animate-pulse">
      Merci de votre patience.
    </div>
    
    <!-- Lien caché pour admin -->
    <NuxtLink to="/auth/login" class="mt-12 text-xs text-slate-300 hover:text-slate-500 transition-colors">
      Accès administrateur
    </NuxtLink>
  </div>
</template>