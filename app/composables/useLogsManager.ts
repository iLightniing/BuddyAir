import { ref, watch, onUnmounted } from 'vue'
import { exportLogsToCsv } from '~/utils/logUtils'

export const useLogsManager = () => {
  const pb = usePocketBase()
  const { info } = useLogger()

  const logs = ref<any[]>([])
  const loading = ref(true)
  const selectedLevel = ref('')
  const searchQuery = ref('')
  const page = ref(1)
  const totalPages = ref(1)
  const isLive = ref(false)
  
  let liveInterval: ReturnType<typeof setInterval> | null = null
  let searchTimer: ReturnType<typeof setTimeout>

  const levels = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'error', label: 'Erreur' },
    { value: 'warn', label: 'Avertissement' },
    { value: 'info', label: 'Info' },
    { value: 'debug', label: 'Debug' },
  ]

  const fetchLogs = async (background = false) => {
    if (!background) loading.value = true
    try {
      const filters = []
      if (selectedLevel.value) filters.push(`level = "${selectedLevel.value}"`)
      if (searchQuery.value) filters.push(`message ~ "${searchQuery.value}"`)

      const result = await pb.collection('logs').getList(page.value, 50, {
        sort: '-created',
        filter: filters.join(' && '),
        expand: 'user'
      })
      logs.value = result.items
      totalPages.value = result.totalPages
    } catch (e) {
      console.error("Erreur chargement des logs:", e)
    } finally {
      if (!background) loading.value = false
    }
  }

  const handleSearch = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      page.value = 1
      fetchLogs()
    }, 300)
  }

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
      fetchLogs()
    }
  }

  const downloadCsv = async () => {
    const originalLoading = loading.value
    loading.value = true
    try {
      const filters = []
      if (selectedLevel.value) filters.push(`level = "${selectedLevel.value}"`)
      if (searchQuery.value) filters.push(`message ~ "${searchQuery.value}"`)

      const records = await pb.collection('logs').getFullList({
        sort: '-created',
        filter: filters.join(' && '),
        expand: 'user'
      })

      exportLogsToCsv(records)
    } catch (e) {
      console.error("Erreur export:", e)
    } finally {
      loading.value = originalLoading
    }
  }

  const createTestLog = async () => {
    await info("Test manuel du système de logs", { 
      demo: true, 
      timestamp: new Date().toISOString(),
      details: "Ceci est un objet JSON complexe pour tester l'affichage." 
    })
    await fetchLogs()
  }

  const clearAllLogs = async () => {
    loading.value = true
    try {
      const allLogs = await pb.collection('logs').getFullList({ fields: 'id' })
      await Promise.all(allLogs.map(l => pb.collection('logs').delete(l.id)))
      logs.value = []
      page.value = 1
      totalPages.value = 1
    } catch(e) {
      console.error(e)
    } finally {
      loading.value = false
      fetchLogs()
    }
  }

  // --- Watchers ---
  watch(selectedLevel, () => {
    page.value = 1
    fetchLogs()
  })

  watch(isLive, (val) => {
    if (val) {
      page.value = 1
      fetchLogs()
      liveInterval = setInterval(() => {
        if (page.value === 1) fetchLogs(true) 
      }, 3000)
    } else {
      if (liveInterval) clearInterval(liveInterval)
    }
  })

  onUnmounted(() => {
    if (liveInterval) clearInterval(liveInterval)
  })

  return {
    logs,
    loading,
    selectedLevel,
    searchQuery,
    page,
    totalPages,
    isLive,
    levels,
    fetchLogs,
    handleSearch,
    changePage,
    downloadCsv,
    createTestLog,
    clearAllLogs
  }
}