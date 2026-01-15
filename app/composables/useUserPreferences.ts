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
    if (val === oldVal || !user.value) return
    try {
      await pb.collection('users').update(user.value.id, { newsletter: val })
      notify('Préférences de newsletter mises à jour.', 'success')
    } catch (e) {
      // Échec silencieux
    }
  })

  // Watch Support Mode
  watch(() => preferences.support_mode, async (val, oldVal) => {
    if (val === oldVal || !user.value) return
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