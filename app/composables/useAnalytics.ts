import { ref, computed, type Ref } from 'vue'
import { getDateRange, processChartData, calculateStats, type TimeRange, type AnalyticsType } from '~/utils/analytics'

export const useAnalytics = (type: Ref<AnalyticsType | null>) => {
  const pb = usePocketBase()
  const loading = ref(false)
  const timeRange = ref<TimeRange>('month')
  const currentDate = ref(new Date())
  const chartData = ref<{ label: string; value: number }[]>([])
  const stats = ref<any>({})

  // Configuration selon le type
  const config = computed(() => {
    switch (type.value) {
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
        collection: 'users'
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

  const resetDate = () => {
    currentDate.value = new Date()
  }

  // Récupération et Agrégation des données
  const fetchData = async () => {
    if (!type.value) return
    loading.value = true
    
    try {
      // 1. Définir les bornes de date via l'utilitaire
      const { start, end } = getDateRange(currentDate.value, timeRange.value)

      // 2. Requête PocketBase
      let filter = `created >= "${start.toISOString()}" && created <= "${end.toISOString()}"`
      if (type.value === 'premium') filter += ` && role = 2`

      const records = await pb.collection(config.value.collection).getFullList({ filter })

      // 3. Traitement des données via les utilitaires
      chartData.value = processChartData(records, timeRange.value, type.value, start, end)
      stats.value = calculateStats(records, type.value)

    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    timeRange,
    currentDate,
    chartData,
    stats,
    config,
    dateLabel,
    navigate,
    resetDate,
    fetchData
  }
}