import { ref } from 'vue'

export const useImpersonation = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()
  
  // On stocke l'admin d'origine dans un état global persistant (pour survivre à la navigation)
  const originalAdmin = useState<any>('original_admin_user', () => null)
  const isImpersonating = useState<boolean>('is_impersonating', () => false)
  const isInitialized = useState<boolean>('impersonation_initialized', () => false)

  // Restauration de l'état au montage (si on rafraîchit la page)
  if (import.meta.client && !isInitialized.value) {
    isInitialized.value = true
    const stored = localStorage.getItem('buddyair_impersonated_user')
    
    // Nettoyage si la session n'est plus valide
    if (!pb.authStore.isValid) {
        isImpersonating.value = false
        originalAdmin.value = null
        localStorage.removeItem('buddyair_impersonated_user')
        localStorage.removeItem('buddyair_original_admin')
    }
    else if (stored) {
      try {
          const storedUser = JSON.parse(stored)
          // Vérification : L'utilisateur connecté doit correspondre à celui stocké
          if (pb.authStore.model?.id === storedUser.id) {
              isImpersonating.value = true
              if (!originalAdmin.value) {
                const adminStored = localStorage.getItem('buddyair_original_admin')
                if (adminStored) {
                    try {
                        originalAdmin.value = JSON.parse(adminStored)
                    } catch (e) {}
                }
              }
          } else {
              // Incohérence détectée (ex: relogin sans stopImpersonation)
              isImpersonating.value = false
              localStorage.removeItem('buddyair_impersonated_user')
              localStorage.removeItem('buddyair_original_admin')
          }
      } catch (e) {
          isImpersonating.value = false
          localStorage.removeItem('buddyair_impersonated_user')
      }
    }
  }

  const startImpersonation = async (targetUser: any) => {
    if (!targetUser) return

    // Sécurité : Vérifier qu'on est bien connecté avant de commencer
    if (!pb.authStore.isValid || !pb.authStore.model) {
        notify("Session invalide. Veuillez vous reconnecter.", "error")
        return
    }

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
    // On ne sauvegarde que si on n'est pas DÉJÀ en train d'impersonner (pour ne pas écraser l'admin avec un user)
    if (!originalAdmin.value && !isImpersonating.value) {
        originalAdmin.value = pb.authStore.model ? JSON.parse(JSON.stringify(pb.authStore.model)) : null
    }

    if (!originalAdmin.value) {
        notify("Impossible de sauvegarder la session administrateur.", "error")
        return
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
        if (stored) {
            try {
                adminModel = JSON.parse(stored)
            } catch (e) {}
        }
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
    if (adminModel) {
        // On s'assure que l'objet admin restauré n'a pas le flag (nettoyage préventif)
        adminModel.is_being_impersonated = false
    }
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
    if (targetUserId) {
        try {
            await pb.collection('users').update(targetUserId, { is_being_impersonated: false })
        } catch (e) {
            console.error("Erreur unflag impersonation", e)
        }
    }

    notify("Retour au compte administrateur", "info")
    await navigateTo('/admin/users')
  }

  return {
    isImpersonating,
    startImpersonation,
    stopImpersonation
  }
}