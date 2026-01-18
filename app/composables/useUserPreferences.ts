export const useUserPreferences = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()

  const preferences = reactive({
    newsletter: user.value?.newsletter ?? false,
    support_mode: user.value?.support_mode ?? false,
  })

  // Watch Newsletter (Persistance)
  watch(() => preferences.newsletter, async (val, oldVal) => {
    // On ignore si c'est un changement dû au chargement initial ou changement d'user
    if (val === oldVal || !user.value || user.value.newsletter === val) return
    
    try {
      await pb.collection('users').update(user.value.id, { newsletter: val })
      notify('Préférences de newsletter mises à jour.', 'success')
    } catch (e) {
      // Échec silencieux
    }
  })

  // Watch Support Mode
  watch(() => preferences.support_mode, async (val, oldVal) => {
    // On ignore si c'est un changement dû au chargement initial ou changement d'user
    if (val === oldVal || !user.value || user.value.support_mode === val || (user.value as any).is_being_impersonated) return

    try {
      await pb.collection('users').update(user.value.id, { support_mode: val })
      notify(val ? 'Mode support activé' : 'Mode support désactivé', 'info')
    } catch (e) {
      // Échec silencieux
    }
  })

  // Synchroniser l'état local avec les données utilisateur
  watchEffect(() => {
    if (user.value) {
      preferences.newsletter = user.value.newsletter ?? false
      preferences.support_mode = user.value.support_mode ?? false
    }
  })

  return {
    preferences,
  }
}