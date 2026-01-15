export const useSystemSettings = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  
  // État global partagé
  const settings = useState<any>('system_settings', () => ({
    id: '',
    maintenance_mode: false,
    maintenance_message: "Nous effectuons une maintenance. De retour bientôt !",
    allow_registrations: true
  }))
  const loading = ref(false)

  const fetchSettings = async () => {
    loading.value = true
    try {
      // On suppose une collection 'system_settings' avec un seul enregistrement
      const result = await pb.collection('system_settings').getFirstListItem('')
      settings.value = result
    } catch (e) {
      // Si pas de settings, on garde les défauts
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings: any) => {
    loading.value = true
    try {
      if (settings.value.id) {
        const updated = await pb.collection('system_settings').update(settings.value.id, newSettings)
        settings.value = updated
      } else {
        // Initialisation si n'existe pas
        const created = await pb.collection('system_settings').create(newSettings)
        settings.value = created
      }
      notify('Paramètres système mis à jour', 'success')
    } catch (e) {
      notify('Erreur lors de la mise à jour', 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings
  }
}