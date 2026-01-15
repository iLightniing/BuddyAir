export const useDashboardRefresh = () => {
  // État partagé globalement pour la clé de rafraîchissement
  const refreshKey = useState<number>('dashboard_refresh_key', () => 0)

  const refresh = () => {
    refreshKey.value++
  }

  return { refreshKey, refresh }
}