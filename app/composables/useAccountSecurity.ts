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
      // Mise à jour de la liste avec les bons noms de collections
      const collections = [
        'transactions', 
        'scheduled_transactions', 
        'accounts', 
        'projects', 
        'budgets', 
        'transaction_categories', // Correction: categories -> transaction_categories
        'payment_methods',        // Ajout
        'tickets',                // Ajout (Support)
        'savings_goals'           // Ajout (Au cas où cette collection existe)
      ]
      
      for (const col of collections) {
        try {
          // On ignore les erreurs si la collection n'existe pas ou est vide
          const records = await pb.collection(col).getFullList({ filter: `user = "${userId}"` }).catch(() => [])
          await Promise.all(records.map(r => pb.collection(col).delete(r.id).catch(() => {})))
        } catch (e) {
          console.warn(`Erreur nettoyage ${col}`, e)
        }
      }

      // Nettoyage spécifique pour les messages de support (champ 'sender' au lieu de 'user')
      try {
         const msgs = await pb.collection('ticket_messages').getFullList({ filter: `sender = "${userId}"` }).catch(() => [])
         await Promise.all(msgs.map(m => pb.collection('ticket_messages').delete(m.id).catch(() => {})))
      } catch {}

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