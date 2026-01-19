// composables/usePocketBase.ts
import PocketBase from 'pocketbase'

let pb: PocketBase | null = null

// Fonction pour restaurer l'impersonation si nécessaire
const enforceImpersonation = (pbInstance: PocketBase) => {
  if (!import.meta.client) return
  
  const impersonatedStr = localStorage.getItem('buddyair_impersonated_user')
  if (impersonatedStr && pbInstance.authStore.isValid) {
    try {
      const userObj = JSON.parse(impersonatedStr)
      // Si le modèle actuel n'est pas celui qu'on veut (ex: écrasé par authRefresh), on le force
      if (pbInstance.authStore.model?.id && pbInstance.authStore.model.id !== userObj.id) {
        // On garde le token actuel (Admin) mais on remet le modèle utilisateur
        pbInstance.authStore.save(pbInstance.authStore.token, userObj)
      }
    } catch (e) {
      console.error("Erreur restauration impersonation", e)
    }
  }
}

export const usePocketBase = () => {
  const config = useRuntimeConfig()
  const POCKETBASE_URL = (config.public?.pocketbaseUrl as string) || 'http://127.0.0.1:8090'

  // Debug : Affiche l'URL utilisée pour être sûr qu'on tape sur la bonne base
  if (import.meta.client && !pb) {
    // On affiche ces alertes UNIQUEMENT en mode développement
    if (import.meta.dev) {
        console.log('🔌 Connexion PocketBase sur :', POCKETBASE_URL)
        if (POCKETBASE_URL.includes('localhost') || POCKETBASE_URL.includes('127.0.0.1')) {
            console.log('%c✅ Mode Développement (Base Locale)', 'color: green; font-weight: bold;')
        } else {
            console.warn('%c⚠️ ATTENTION : Vous êtes connecté à une base de données DISTANTE (Production ?)', 'color: red; font-weight: bold; font-size: 1.2em;')
        }
    }
  }

  // Sur le client, on utilise une instance unique (Singleton) pour conserver le store d'auth
  if (import.meta.client) {
    if (!pb) {
      pb = new PocketBase(POCKETBASE_URL)
      
      // 1. Restauration initiale
      enforceImpersonation(pb)

      // 2. Protection contre les écrasements (ex: authRefresh automatique)
      pb.authStore.onChange(() => {
        enforceImpersonation(pb!)
        // Force la mise à jour du state Nuxt global pour que l'interface réagisse
        try {
            const user = useState<any>('pb_user')
            if (user.value?.id !== pb!.authStore.model?.id) {
                user.value = pb!.authStore.model
            }
        } catch (e) {}
      })
    }
    return pb
  }
  
  // Sur le serveur, on crée une nouvelle instance à chaque requête
  return new PocketBase(POCKETBASE_URL)
}

export const usePocketBaseUser = () => {
  const pb = usePocketBase()
  const user = useState<any>('pb_user', () => pb.authStore.model)

  // FIX: Force la synchronisation sur le client si le store a changé (ex: impersonation restaurée)
  // Cela corrige le problème où l'hydratation SSR écrase l'état local restauré
  if (import.meta.client) {
    if (pb.authStore.model && user.value?.id !== pb.authStore.model.id) {
      user.value = pb.authStore.model
    }
  }

  return user
}