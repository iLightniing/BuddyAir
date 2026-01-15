<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SimpleChart from '~/components/ui/SimpleChart.vue'

const props = defineProps<{
  show: boolean
  type: 'users' | 'premium' | 'transactions' | null
}>()

const emit = defineEmits(['close'])

const pb = usePocketBase()
const loading = ref(false)
const timeRange = ref<'week' | 'month' | 'year'>('month')
const currentDate = ref(new Date())
const chartData = ref<{ label: string; value: number }[]>([])
const stats = ref<any>({})

// Configuration selon le type
const config = computed(() => {
  switch (props.type) {
    case 'users': return { 
      title: 'Analytique Utilisateurs', 
      icon: 'lucide:users', 
      color: 'blue',
      collection: 'users'
    }
    case 'premium': return { 
      title: 'Analytique Premium', 
      icon: 'lucide:crown', 
      color: 'amber',
      collection: 'users' // On filtre sur role
    }
    case 'transactions': return { 
      title: 'Analytique Transactions', 
      icon: 'lucide:activity', 
      color: 'emerald',
      collection: 'transactions'
    }
    default: return { title: '', icon: '', color: 'gray', collection: '' }
  }
})

// Formatage de la date affichée
const dateLabel = computed(() => {
  const d = currentDate.value
  if (timeRange.value === 'week') return `Semaine du ${d.toLocaleDateString('fr-FR')}`
  if (timeRange.value === 'month') return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  if (timeRange.value === 'year') return d.getFullYear().toString()
  return ''
})

// Navigation temporelle
const navigate = (dir: number) => {
  const d = new Date(currentDate.value)
  if (timeRange.value === 'week') d.setDate(d.getDate() + (dir * 7))
  if (timeRange.value === 'month') d.setMonth(d.getMonth() + dir)
  if (timeRange.value === 'year') d.setFullYear(d.getFullYear() + dir)
  currentDate.value = d
  fetchData()
}

// Récupération et Agrégation des données
const fetchData = async () => {
  if (!props.type || !props.show) return
  loading.value = true
  
  try {
    // 1. Définir les bornes de date
    const start = new Date(currentDate.value)
    const end = new Date(currentDate.value)
    
    if (timeRange.value === 'week') {
      const day = start.getDay() || 7
      start.setDate(start.getDate() - day + 1)
      start.setHours(0,0,0,0)
      end.setDate(start.getDate() + 6)
      end.setHours(23,59,59,999)
    } else if (timeRange.value === 'month') {
      start.setDate(1)
      start.setHours(0,0,0,0)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23,59,59,999)
    } else { // year
      start.setMonth(0, 1)
      start.setHours(0,0,0,0)
      end.setMonth(11, 31)
      end.setHours(23,59,59,999)
    }

    // 2. Requête PocketBase
    let filter = `created >= "${start.toISOString()}" && created <= "${end.toISOString()}"`
    if (props.type === 'premium') filter += ` && role = 2` // Supposons role 2 = Premium

    const records = await pb.collection(config.value.collection).getFullList({ filter })

    // 3. Agrégation pour le graphique
    const buckets: Record<string, number> = {}
    const labels: string[] = []
    
    // Initialiser les buckets vides
    if (timeRange.value === 'week') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i)
        const key = d.toLocaleDateString('fr-FR', { weekday: 'short' })
        buckets[key] = 0; labels.push(key)
      }
    } else if (timeRange.value === 'month') {
      const daysInMonth = end.getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        buckets[i.toString()] = 0; labels.push(i.toString())
      }
    } else { // year
      for (let i = 0; i < 12; i++) {
        const d = new Date(start); d.setMonth(i)
        const key = d.toLocaleDateString('fr-FR', { month: 'short' })
        buckets[key] = 0; labels.push(key)
      }
    }

    // Remplir les buckets
    records.forEach(r => {
      const d = new Date(r.created)
      let key = ''
      if (timeRange.value === 'week') key = d.toLocaleDateString('fr-FR', { weekday: 'short' })
      else if (timeRange.value === 'month') key = d.getDate().toString()
      else key = d.toLocaleDateString('fr-FR', { month: 'short' })
      
      if (buckets[key] !== undefined) {
        if (props.type === 'transactions') buckets[key] = (buckets[key] as number) + Math.abs(r.amount || 0) // Volume d'activité (absolu)
        else buckets[key] = (buckets[key] as number) + 1 // Compte pour users/premium
      }
    })

    chartData.value = labels.map(l => ({ label: l, value: Math.round((buckets[l] || 0) * 100) / 100 }))

    // 4. Stats Résumé
    if (props.type === 'users') {
      stats.value = { total: records.length, label: 'Inscriptions' }
    } else if (props.type === 'premium') {
      // Estimation CA (Ex: 9.99€/mois)
      const revenue = records.length * 9.99
      stats.value = { total: records.length, label: 'Nouveaux Premium', revenue: `${revenue.toFixed(2)}€` }
    } else {
      let income = 0
      let expense = 0
      records.forEach(r => {
          const val = Math.abs(r.amount || 0)
          if (r.type === 'income') income += val
          else expense += val
      })
      const balance = income - expense
      stats.value = { income: `${income.toFixed(2)}€`, expense: `${expense.toFixed(2)}€`, balance: `${balance > 0 ? '+' : ''}${balance.toFixed(2)}€` }
    }

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) {
    currentDate.value = new Date()
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