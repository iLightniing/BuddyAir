import { computed } from 'vue'
import { useSystemSettings } from './useSystemSettings'

export const useMaintenanceManager = () => {
  const { settings, loading, fetchSettings, updateSettings } = useSystemSettings()

  // Helpers pour convertir ISO (DB) <-> Local (Input)
  const toLocal = (isoStr: string) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const toISO = (localStr: string) => {
    if (!localStr) return ''
    return new Date(localStr).toISOString()
  }

  // Computed pour les inputs (lecture/écriture)
  const localStart = computed({
    get: () => toLocal(settings.value.maintenance_start),
    set: (val) => settings.value.maintenance_start = toISO(val)
  })
  const localEnd = computed({
    get: () => toLocal(settings.value.maintenance_end),
    set: (val) => settings.value.maintenance_end = toISO(val)
  })

  const save = async () => {
    await updateSettings(settings.value)
  }

  const scheduleMaintenance = async () => {
    if (!settings.value.maintenance_start || !settings.value.maintenance_end) return
    settings.value.maintenance_active = true
    await save()
  }

  const cancelMaintenance = async () => {
    settings.value.maintenance_active = false
    settings.value.maintenance_start = ''
    settings.value.maintenance_end = ''
    await save()
  }

  // La maintenance est considérée comme "programmée" si le flag est actif ET que la date de fin n'est pas passée
  const isScheduled = computed(() => {
      if (!settings.value.maintenance_active) return false
      if (!settings.value.maintenance_end) return true // Active indéfiniment si pas de fin
      return new Date(settings.value.maintenance_end) > new Date()
  })

  const isExpired = computed(() => settings.value.maintenance_active && !isScheduled.value)

  // Helper pour vérifier si les dates sont valides
  const canSchedule = computed(() => {
      return settings.value.maintenance_start && settings.value.maintenance_end && new Date(settings.value.maintenance_start) < new Date(settings.value.maintenance_end)
  })

  const init = () => {
    fetchSettings()
  }

  return {
    settings,
    loading,
    localStart,
    localEnd,
    isScheduled,
    isExpired,
    canSchedule,
    save,
    scheduleMaintenance,
    cancelMaintenance,
    init
  }
}