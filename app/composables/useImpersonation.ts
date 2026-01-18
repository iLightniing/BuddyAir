import { ref } from 'vue'

export const useImpersonation = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()
  
  // On stocke l'admin d'origine dans un état global persistant (pour survivre à la navigation)
  const originalAdmin = useState<any>('original_admin_user', () => null)
  const isImpersonating = useState<boolean>('is_impersonating', () => false)

  // Restauration de l'état au montage (si on rafraîchit la page)
  if (import.meta.client) {
    const stored = localStorage.getItem('buddyair_impersonated_user')
    if (stored) {
      isImpersonating.value = true
      if (!originalAdmin.value) {
        const adminStored = localStorage.getItem('buddyair_original_admin')
        if (adminStored) originalAdmin.value = JSON.parse(adminStored)
      }
    }
  }

  const startImpersonation = async (targetUser: any) => {
    if (!targetUser) return

    // Calcul explicite du nom d'affichage avant toute transformation
    const displayName = targetUser.name || targetUser.username || targetUser.email?.split('@')[0] || 'Utilisateur'

    // 1. Copie propre des données (évite les Proxies et récupère tous les champs)
    const cleanUser = JSON.parse(JSON.stringify(targetUser))

    if (!cleanUser.support_mode) {
      notify("L'utilisateur n'a pas activé le mode support.", "error")
      return
    }

    const userObj = {
      ...cleanUser,
      name: displayName, // On utilise le nom calculé explicitement
      is_being_impersonated: true
    }

    // 2. Sauvegarde de l'admin actuel
    if (!originalAdmin.value) {
        originalAdmin.value = pb.authStore.model ? JSON.parse(JSON.stringify(pb.authStore.model)) : null
    }

    // 3. Persistance dans localStorage (pour survivre au refresh/navigation)
    if (import.meta.client) {
        localStorage.setItem('buddyair_original_admin', JSON.stringify(originalAdmin.value))
        localStorage.setItem('buddyair_impersonated_user', JSON.stringify(userObj))
    }

    // 4. Mise à jour du store PB et du state Nuxt
    pb.authStore.save(pb.authStore.token, userObj)
    user.value = userObj
    isImpersonating.value = true

    // 5. Flag en BDD
    try {
        await pb.collection('users').update(userObj.id, { is_being_impersonated: true })
    } catch (e) {
        console.error("Erreur flag impersonation", e)
    }

    notify(`Connecté en tant que ${displayName}`, "success")
    
    // Navigation fluide (SPA) pour éviter le double chargement
    await navigateTo('/dashboard')
  }

  const stopImpersonation = async () => {
    let adminModel = originalAdmin.value
    
    // Tentative de récupération depuis le storage si le state est perdu
    if (!adminModel && import.meta.client) {
        const stored = localStorage.getItem('buddyair_original_admin')
        if (stored) adminModel = JSON.parse(stored)
    }

    if (!adminModel) {
        notify("Session admin perdue. Reconnexion requise.", "error")
        pb.authStore.clear()
        user.value = null
        if (import.meta.client) {
            localStorage.removeItem('buddyair_impersonated_user')
            localStorage.removeItem('buddyair_original_admin')
        }
        return navigateTo('/auth/login')
    }

    const targetUserId = user.value?.id

    // Restauration de l'admin
    pb.authStore.save(pb.authStore.token, adminModel)
    user.value = adminModel
    
    // Nettoyage
    originalAdmin.value = null
    isImpersonating.value = false
    
    if (import.meta.client) {
        localStorage.removeItem('buddyair_impersonated_user')
        localStorage.removeItem('buddyair_original_admin')
    }

    // Retirer le flag dans la BDD
    if (targetUserId && targetUserId !== adminModel.id) {
        try {
            await pb.collection('users').update(targetUserId, { is_being_impersonated: false })
        } catch (e) {
            console.error("Erreur unflag impersonation", e)
        }
    }

    notify("Retour au compte administrateur", "info")
    if (import.meta.client) window.location.href = '/admin/users'
  }

  return {
    isImpersonating,
    startImpersonation,
    stopImpersonation
  }
}