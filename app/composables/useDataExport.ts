export const useDataExport = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const isExporting = ref(false)
  const isImporting = ref(false)

  const exportData = async (collection: string, format: 'csv' | 'json') => {
    isExporting.value = true
    try {
      const user = pb.authStore.model
      if (!user) return

      const records = await pb.collection(collection).getFullList({
        filter: `user = "${user.id}"`,
        sort: '-created'
      })

      const filename = `buddyair_${collection}_${new Date().toISOString().split('T')[0]}.${format}`

      if (format === 'json') {
        downloadFile(JSON.stringify(records, null, 2), filename, 'application/json')
      } else {
        // On nettoie les données pour le CSV (pas d'expansion complexe pour l'instant)
        const flatRecords = records.map(({ expand, ...rest }) => rest)
        downloadFile(convertToCSV(flatRecords), filename, 'text/csv')
      }
      
      notify(`Export ${collection} (${format.toUpperCase()}) réussi`, 'success')
    } catch (e) {
      console.error(e)
      notify("Erreur lors de l'export", 'error')
    } finally {
      isExporting.value = false
    }
  }

  const exportAllData = async () => {
    isExporting.value = true
    try {
      const user = pb.authStore.model
      if (!user) return

      const collections = ['accounts', 'transactions', 'categories', 'scheduled_transactions', 'projects', 'budgets']
      const backup: Record<string, any[]> = {}

      for (const col of collections) {
        try {
            backup[col] = await pb.collection(col).getFullList({
                filter: `user = "${user.id}"`,
                sort: '-created'
            })
        } catch (e) {
            console.warn(`Skipping ${col} in backup`, e)
            backup[col] = []
        }
      }

      const filename = `buddyair_full_backup_${new Date().toISOString().split('T')[0]}.json`
      downloadFile(JSON.stringify(backup, null, 2), filename, 'application/json')
      
      notify('Sauvegarde complète téléchargée', 'success')
    } catch (e) {
      console.error(e)
      notify("Erreur lors de la sauvegarde complète", 'error')
    } finally {
      isExporting.value = false
    }
  }

  const importFile = async (file: File) => {
      isImporting.value = true
      try {
          // Simulation de lecture pour l'instant
          await new Promise(resolve => setTimeout(resolve, 1000))
          notify("Fonctionnalité d'importation bientôt disponible.", "info")
          console.log("Fichier reçu:", file.name)
      } catch (e) {
          notify("Erreur de lecture du fichier", "error")
      } finally {
          isImporting.value = false
      }
  }

  return {
    isExporting,
    isImporting,
    exportData,
    exportAllData,
    importFile
  }
}