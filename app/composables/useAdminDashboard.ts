export const useAdminDashboard = () => {
  const pb = usePocketBase()
  const stats = ref({
    totalUsers: 0,
    premiumUsers: 0,
    totalTransactions: 0,
    totalProjects: 0
  })
  const loading = ref(false)

  const fetchStats = async () => {
    loading.value = true
    try {
      // On utilise getList(1, 1) pour ne récupérer que le totalItems (count) sans charger toutes les données
      // requestKey: null est CRUCIAL ici pour éviter que PocketBase n'annule les requêtes simultanées
      const [users, premium, tx, projects] = await Promise.all([
        pb.collection('users').getList(1, 1, { requestKey: null }),
        pb.collection('users').getList(1, 1, { filter: 'role = 2', requestKey: null }), // 2 = Premium
        pb.collection('transactions').getList(1, 1, { requestKey: null }),
        pb.collection('savings_goals').getList(1, 1, { requestKey: null })
      ])

      stats.value = {
        totalUsers: users.totalItems,
        premiumUsers: premium.totalItems,
        totalTransactions: tx.totalItems,
        totalProjects: projects.totalItems
      }
    } catch (e) {
      console.error("Erreur chargement stats admin", e)
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, fetchStats }
}