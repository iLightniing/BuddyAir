export const useAccountSecurity = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()

  const showDeleteConfirm = ref(false)
  const isDeleting = ref(false)

  const deleteAccount = async () => {
    if (!user.value) return
    isDeleting.value = true
    try {
      const userId = user.value.id
      
      // 1. Suppression des données liées (Best effort si pas de cascade)
      const collections = ['transactions', 'scheduled_transactions', 'accounts', 'projects', 'budgets', 'categories']
      
      for (const col of collections) {
        try {
          const records = await pb.collection(col).getFullList({ filter: `user = "${userId}"` })
          await Promise.all(records.map(r => pb.collection(col).delete(r.id)))
        } catch (e) {
          console.warn(`Erreur nettoyage ${col}`, e)
        }
      }

      // 2. Suppression de l'utilisateur
      await pb.collection('users').delete(userId)
      
      // 3. Logout & Redirect
      pb.authStore.clear()
      user.value = null
      navigateTo('/auth/login')
    } catch (e) {
      console.error(e)
      notify('Erreur critique lors de la suppression du compte', 'error')
      isDeleting.value = false
      showDeleteConfirm.value = false
    }
  }

  return {
    showDeleteConfirm,
    isDeleting,
    deleteAccount,
  }
}