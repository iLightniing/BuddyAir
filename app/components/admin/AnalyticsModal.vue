<script setup lang="ts">
import { toRef } from 'vue'
import { useAnalytics } from '~/composables/useAnalytics'
import SimpleChart from '~/components/ui/SimpleChart.vue'

const props = defineProps<{
  show: boolean
  type: 'users' | 'premium' | 'transactions' | null
}>()

const emit = defineEmits(['close'])

// On passe la prop 'type' en tant que Ref au composable pour qu'il réagisse aux changements
const { 
  loading, timeRange, chartData, stats, config, dateLabel, 
  navigate, resetDate, fetchData 
} = useAnalytics(toRef(props, 'type'))

// Quand la modale s'ouvre, on reset la date et on charge les données
watch(() => props.show, (val) => {
  if (val) {
    resetDate()
    fetchData()
  }
})
</script>

<template>
  <UiModal :show="show" @close="emit('close')">
    <div class="bg-ui-surface border border-ui-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="p-6 border-b border-ui-border flex justify-between items-center bg-ui-surface-muted/30">
        <div class="flex items-center gap-3">
          <div :class="`p-2 rounded-lg bg-${config.color}-100 text-${config.color}-600`">
            <Icon :name="config.icon" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-xl font-black text-ui-content">{{ config.title }}</h3>
            <p class="text-sm text-ui-content-muted capitalize">{{ dateLabel }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 hover:bg-ui-surface-muted rounded-full transition-colors">
          <Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" />
        </button>
      </div>

      <!-- Controls -->
      <div class="p-4 border-b border-ui-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-ui-surface">
        <!-- Période -->
        <div class="flex bg-ui-surface-muted p-1 rounded-lg border border-ui-border">
          <button 
            v-for="range in ['week', 'month', 'year']" 
            :key="range"
            @click="timeRange = range as any; fetchData()"
            class="px-4 py-1.5 text-xs font-bold rounded-md transition-all capitalize"
            :class="timeRange === range ? 'bg-white text-ui-content shadow-sm' : 'text-ui-content-muted hover:text-ui-content'"
          >
            {{ range === 'week' ? 'Semaine' : (range === 'month' ? 'Mois' : 'Année') }}
          </button>
        </div>

        <!-- Navigation -->
        <div class="flex items-center gap-2">
          <button @click="navigate(-1)" class="p-1.5 hover:bg-ui-surface-muted rounded-md border border-transparent hover:border-ui-border transition-all">
            <Icon name="lucide:chevron-left" class="w-5 h-5 text-ui-content-muted" />
          </button>
          <span class="text-sm font-bold text-ui-content min-w-[120px] text-center">{{ dateLabel }}</span>
          <button @click="navigate(1)" class="p-1.5 hover:bg-ui-surface-muted rounded-md border border-transparent hover:border-ui-border transition-all">
            <Icon name="lucide:chevron-right" class="w-5 h-5 text-ui-content-muted" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto relative min-h-[300px]">
        <!-- Loading Overlay (Plus doux que le remplacement) -->
        <div v-if="loading" class="absolute inset-0 bg-ui-surface/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-opacity duration-300">
          <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
        </div>
        
        <div class="space-y-8 transition-opacity duration-300" :class="{ 'opacity-40': loading }">
          <!-- Résumé Chiffres -->
          <div v-if="type === 'transactions'" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div class="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <p class="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Crédit (Revenus)</p>
                <p class="text-2xl font-black text-emerald-700">{{ stats.income }}</p>
             </div>
             <div class="bg-red-50/50 p-4 rounded-xl border border-red-100">
                <p class="text-xs font-bold text-red-600/70 uppercase tracking-wider mb-1">Débit (Dépenses)</p>
                <p class="text-2xl font-black text-red-700">{{ stats.expense }}</p>
             </div>
             <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p class="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-1">Résultat (Net)</p>
                <p class="text-2xl font-black text-blue-700">{{ stats.balance }}</p>
             </div>
          </div>

          <div v-else class="grid grid-cols-2 gap-4">
            <div class="bg-ui-surface-muted/50 p-4 rounded-xl border border-ui-border">
              <p class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-1">{{ stats.label }}</p>
              <p class="text-3xl font-black text-ui-content">{{ stats.total }}</p>
            </div>
            <div v-if="stats.revenue" class="bg-ui-surface-muted/50 p-4 rounded-xl border border-ui-border">
              <p class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-1">CA Estimé</p>
              <p class="text-3xl font-black" :class="`text-${config.color}-600`">{{ stats.revenue }}</p>
            </div>
          </div>

          <!-- Graphique -->
          <div>
            <h4 class="text-sm font-bold text-ui-content mb-4">Évolution sur la période</h4>
            <SimpleChart :data="chartData" :color="config.color" />
          </div>
        </div>
      </div>

    </div>
  </UiModal>
</template>