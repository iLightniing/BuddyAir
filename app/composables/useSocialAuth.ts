export const useSocialAuth = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const user = usePocketBaseUser()
  const route = useRoute()
  
  const loading = ref(false)

  const loginWithGoogle = async (mode?: 'login' | 'register') => {
    // Détection automatique du mode selon l'URL si non spécifié
    const currentMode = mode || (route.path.includes('login') ? 'login' : 'register')

    loading.value = true
    try {
      // Lancement du flux OAuth2 via Popup
      // Cela gère à la fois l'inscription et la connexion
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' })
      
      // Vérification post-login
      if (pb.authStore.isValid && authData.record) {
        const isNew = authData.meta?.isNew

        // Si on est en mode "connexion" et que c'est un nouveau compte, on refuse
        if (currentMode === 'login' && isNew) {
            await pb.collection('users').delete(authData.record.id)
            pb.authStore.clear()
            user.value = null
            notify("Aucun compte associé à cet email. Veuillez vous inscrire.", "error")
            return
        }

        let record = authData.record

        // Si c'est une nouvelle inscription, on force le role à 1 (Gratuit)
        if (isNew) {
            record = await pb.collection('users').update(record.id, { role: 1 })
            pb.authStore.save(pb.authStore.token, record)
        }

        user.value = record
        
        const name = record.name || record.email
        
        notify(isNew ? `Compte créé ! Bienvenue ${name}` : `Bon retour ${name}`, 'success')
        await navigateTo('/dashboard')
      }
    } catch (e: any) {
      // On ignore l'erreur si l'utilisateur ferme la popup volontairement
      if (e.isAbort) return
      
      console.error("Erreur OAuth:", e)
      notify("Impossible de se connecter avec Google.", "error")
    } finally {
      loading.value = false
    }
  }

  return {
    loginWithGoogle,
    loading
  }
}