<script setup lang="ts">
// Les imports (ref, computed, etc.) sont automatiques dans Nuxt 3
const user = useSupabaseUser()
const route = useRoute()

// Récupération du titre depuis la meta de la route
const pageTitle = computed(() => route.meta.title as string || 'Tableau de bord')

// Gestion de la date et de l'heure
const currentTime = ref('')
const currentDate = ref('')
const isShuffling = ref(false)

const updateDateTime = () => {
  if (isShuffling.value) return
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Animation de défilement des chiffres (Shuffle)
const shuffleTime = () => {
  if (isShuffling.value) return
  isShuffling.value = true
  let iterations = 0
  const interval = setInterval(() => {
    const randomH = Math.floor(Math.random() * 24).toString().padStart(2, '0')
    const randomM = Math.floor(Math.random() * 60).toString().padStart(2, '0')
    currentTime.value = `${randomH}:${randomM}`
    iterations++
    if (iterations > 10) {
      clearInterval(interval)
      isShuffling.value = false
      updateDateTime()
    }
  }, 40)
}

let timer: any
onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

// Placeholder pour la météo (Concise)
const weather = ref({ temp: 4, icon: 'lucide:cloud-snow', label: 'Ciel voilé' })
</script>

<template>
  <header class="h-12 border-b border-ui-border bg-ui-surface/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 w-full">
    <!-- Gauche : Salutations -->
    <div class="flex items-center gap-3">
      <span class="text-sm font-black text-ui-content tracking-tight whitespace-nowrap">
        Bonjour, {{ user?.user_metadata?.username || 'Aventurier' }}
      </span>
    </div>

    <!-- Centre : Titre du menu -->
    <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
      <div class="h-0.5 w-6 bg-linear-to-r from-blue-400 to-pink-400 rounded-full mb-1.5"></div>
      <h2 class="text-ui-content font-black uppercase tracking-[0.4em] text-[10px]">
        {{ pageTitle }}
      </h2>
    </div>

    <!-- Droite : Date, Heure & Météo -->
    <div class="flex items-center gap-6">
      <!-- Météo -->
      <div class="hidden sm:flex items-center gap-3 px-3 py-1 cursor-default group/weather">
        <div class="flex flex-col items-end">
          <span class="text-[9px] font-black text-ui-content-muted uppercase tracking-tighter">{{ weather.label }}</span>
          <span class="text-xs font-black text-ui-content">{{ weather.temp }}°C</span>
        </div>
        <Icon :name="weather.icon" class="w-5 h-5 text-blue-400 group-hover/weather:rotate-[360deg] transition-transform duration-700 ease-in-out" />
      </div>

      <!-- Séparateur -->
      <div class="h-8 w-px bg-ui-border"></div>

      <!-- Date & Heure -->
      <div @mouseenter="shuffleTime" class="flex items-center gap-4 px-3 py-1 cursor-default group/time">
        <div class="flex flex-col items-end leading-none transition-all duration-300">
          <span class="text-[9px] font-black text-pink-500 uppercase tracking-tighter mb-0.5 group-hover/time:text-ui-content transition-colors">{{ currentDate }}</span>
          <span class="text-lg font-black text-ui-content tracking-tighter tabular-nums">
            {{ currentTime }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>