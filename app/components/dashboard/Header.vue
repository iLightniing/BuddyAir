<script setup lang="ts">
const user = usePocketBaseUser()
const route = useRoute()
import { useCommandPalette } from '@/composables/useCommandPalette'
import AdminRefreshButton from './AdminRefreshButton.vue'
import { useSystemSettings } from '~/composables/useSystemSettings'
import { useClock } from '~/composables/useClock'

// Récupération du titre depuis la meta de la route
const pageTitle = computed(() => route.meta.title as string || 'Tableau de bord')

const { currentTime, currentDate, shuffleTime } = useClock()

// Météo dynamique
const { weather, fetchWeather } = useWeather()
onMounted(fetchWeather)

const { open } = useCommandPalette()

// Maintenance
const { settings, isMaintenanceNow } = useSystemSettings()
const showMaintenancePreview = ref(false)
</script>

<template>
  <header class="h-12 border-b border-ui-border bg-ui-surface/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 w-full">
    <!-- Gauche : Salutations -->
    <div class="flex items-center gap-3 w-1/3 justify-start">
      <!-- Command Palette Trigger -->
      <button @click="open" class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-ui-surface-muted hover:bg-white border border-ui-border rounded-lg text-xs text-ui-content-muted hover:text-ui-content transition-all group shadow-sm hover:shadow">
        <Icon name="lucide:search" class="w-3.5 h-3.5" />
        <span class="font-medium">Rechercher...</span>
        <span class="ml-2 px-1.5 py-0.5 bg-ui-surface border border-ui-border rounded text-[9px] font-bold group-hover:border-blue-200">Ctrl K</span>
      </button>
    </div>

    <!-- Centre : Titre du menu -->
    <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
      <div class="h-0.5 w-6 bg-linear-to-r from-blue-400 to-pink-400 rounded-full mb-1.5"></div>
      <h2 class="text-ui-content font-black uppercase tracking-[0.4em] text-[10px]" v-html="pageTitle"></h2>
    </div>

    <!-- Droite : Date, Heure & Météo -->
    <div class="flex items-center gap-6">
      <!-- Indicateur Maintenance (Admin) -->
      <button 
        v-if="user?.role === 3 && settings.maintenance_active"
        @click="showMaintenancePreview = true"
        class="p-2 rounded-lg transition-all group relative hover:bg-ui-surface-muted"
        :class="isMaintenanceNow ? 'text-orange-600 animate-pulse' : 'text-ui-content-muted hover:text-orange-600'"
        title="Aperçu de la maintenance"
      >
        <div class="relative">
          <Icon name="lucide:construction" class="w-4 h-4" />
          <span v-if="isMaintenanceNow" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
      </button>

      <!-- Bouton Refresh Admin -->
      <AdminRefreshButton />

      <!-- Météo -->
      <div class="hidden sm:flex items-center gap-3 px-3 py-1 cursor-default group/weather">
        <div class="flex flex-col items-end">
          <span class="text-[9px] font-black text-ui-content-muted uppercase tracking-tighter" :title="weather.city">{{ weather.label }}</span>
          <span class="text-xs font-black text-ui-content">{{ weather.temp }}<span v-if="weather.temp !== '...'">°C</span></span>
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

  <!-- Modale Aperçu Maintenance -->
  <UiModal :show="showMaintenancePreview" @close="showMaintenancePreview = false">
      <div class="w-full max-w-[95vw] h-[90vh] bg-white rounded-2xl overflow-hidden relative shadow-2xl border border-ui-border">
          <button @click="showMaintenancePreview = false" class="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md rounded-full transition-all">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
          <iframe src="/maintenance" class="w-full h-full border-none"></iframe>
      </div>
  </UiModal>
</template>