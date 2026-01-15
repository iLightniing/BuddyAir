import { ref, computed } from 'vue'

export const useSystemSettings = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  
  // État global partagé
  const settings = useState<any>('system_settings', () => ({
    id: '',
    maintenance_active: false, // Flag global (activé si programmé)
    maintenance_message: "Nous effectuons une maintenance. De retour bientôt !",
    maintenance_start: '',
    maintenance_end: '',
    allow_registrations: true
  }))
  const loading = ref(false)

  // Vérifie si la maintenance est *effectivement* en cours (dans la fenêtre de temps)
  const isMaintenanceNow = computed(() => {
    if (!settings.value.maintenance_active) return false
    if (!settings.value.maintenance_start || !settings.value.maintenance_end) return false
    
    const now = new Date().getTime()
    const start = new Date(settings.value.maintenance_start).getTime()
    const end = new Date(settings.value.maintenance_end).getTime()
    
    return now >= start && now <= end
  })

  const fetchSettings = async () => {
    loading.value = true
    try {
      // On suppose une collection 'system_settings' avec un seul enregistrement
      const result = await pb.collection('system_settings').getFirstListItem('')
      settings.value = result
    } catch (e) {
      // Si pas de settings, on garde les défauts
      console.error("Impossible de charger la configuration système (Vérifiez les API Rules de 'system_settings'):", e)
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings: any) => {
    loading.value = true
    try {
      if (settings.value.id) {
        await pb.collection('system_settings').update(settings.value.id, newSettings)
      } else {
        // Initialisation si n'existe pas
        const created = await pb.collection('system_settings').create(newSettings)
        settings.value.id = created.id
      }
      // On ne remplace pas settings.value avec le retour de PB pour ne pas écraser l'heure locale affichée
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
    isMaintenanceNow,
    fetchSettings,
    updateSettings
  }
}