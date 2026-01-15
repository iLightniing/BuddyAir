import { ref } from 'vue'

export const useImpersonation = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()
  
  // On stocke l'admin d'origine dans un état global persistant (pour survivre à la navigation)
  const originalAdmin = useState<any>('original_admin_user', () => null)
  const isImpersonating = useState<boolean>('is_impersonating', () => false)

  const startImpersonation = async (targetUser: any) => {
    if (!targetUser.support_mode) {
      notify("L'utilisateur n'a pas activé le mode support.", "error")
      return
    }

    // 0. Marquer l'utilisateur comme étant "observé" dans la BDD
    try {
        await pb.collection('users').update(targetUser.id, { is_being_impersonated: true })
    } catch (e) {
        console.error("Erreur flag impersonation", e)
    }

    // 1. Sauvegarde de l'admin
    originalAdmin.value = JSON.parse(JSON.stringify(user.value))
    
    // 2. Remplacement de l'utilisateur courant (L'interface va réagir et afficher les données de targetUser)
    // Note : On garde le token d'admin dans pb.authStore, donc les API calls passeront
    // à condition que les API Rules autorisent l'admin à voir les données des autres.
    user.value = { ...targetUser, is_being_impersonated: true }
    isImpersonating.value = true

    notify(`Connecté en tant que ${targetUser.email}`, "success")
    await navigateTo('/dashboard', { replace: true })
  }

  const stopImpersonation = async () => {
    if (!originalAdmin.value) return

    const targetUserId = user.value?.id

    // Restauration de l'admin
    user.value = originalAdmin.value
    
    // Nettoyage
    originalAdmin.value = null
    isImpersonating.value = false

    // Retirer le flag dans la BDD
    if (targetUserId) {
        try {
            await pb.collection('users').update(targetUserId, { is_being_impersonated: false })
        } catch (e) {
            console.error("Erreur unflag impersonation", e)
        }
    }

    notify("Retour au compte administrateur", "info")
    navigateTo('/admin/users')
  }

  return {
    isImpersonating,
    startImpersonation,
    stopImpersonation
  }
}