import { ref, computed } from 'vue'

export const useCategories = () => {
  const pb = usePocketBase()
  
  // State global partagé
  const categories = useState<any[]>('categories', () => [])
  const loading = useState<boolean>('categories_loading', () => false)
  const initialized = useState<boolean>('categories_initialized', () => false)
  const subscribed = useState<boolean>('categories_subscribed', () => false)

  const fetchCategories = async (force = false) => {
    if (loading.value) return // Évite les appels concurrents qui créent des doublons ou des erreurs
    if (!force && initialized.value && categories.value.length > 0) return
    
    loading.value = true
    const user = pb.authStore.model
    if (!user) return

    try {
      // 1. Récupérer les catégories locales (User)
      const localResult = await pb.collection('transaction_categories').getFullList({
        sort: '+order',
      })
      
      // Affichage immédiat
      categories.value = localResult

      // 2. Récupérer les catégories système (Admin) pour la synchro
      let systemResult: any[] = []
      try {
        systemResult = await pb.collection('categories').getFullList({
          sort: '+order',
        })
      } catch (err) {
         // Si pas d'accès ou collection vide, on arrête la synchro
         return
      }

      // 2.5. Synchro des mises à jour (Admin -> User)
      // On met à jour les sous-catégories et le statut is_system pour les catégories existantes
      const updatesPromises = localResult.map(local => {
          const sysMatch = systemResult.find(sys => sys.name === local.name)
          
          if (sysMatch) {
              // Si c'est une catégorie système, on force la synchro des sous-catégories et du lock
              // On injecte la liste des sous-catégories verrouillées (celles du système) dans l'objet local pour l'UI
              local.locked_sub_categories = sysMatch.sub_categories || []
              
              const sysSubs = sysMatch.sub_categories || []
              const localSubs = local.sub_categories || []
              
              // On identifie les sous-catégories système qui manquent localement (nouveautés admin)
              const missingSubs = sysSubs.filter((s: string) => !localSubs.includes(s))
              
              if (!local.is_system || missingSubs.length > 0) {
                  const newSubs = [...localSubs, ...missingSubs]
                  local.is_system = true
                  local.sub_categories = newSubs
                  return pb.collection('transaction_categories').update(local.id, {
                      is_system: true,
                      sub_categories: newSubs
                  }, { requestKey: null }).catch(() => null) // On ignore les erreurs d'update individuelles
              }
          }
          return null
      }).filter(Boolean)
      
      if (updatesPromises.length > 0) {
          await Promise.all(updatesPromises)
      }

      // 3. Synchro : Identifier et créer les catégories manquantes
      const missingCategories = systemResult.filter(sysCat => 
        !localResult.some(localCat => localCat.name === sysCat.name)
      )

      if (missingCategories.length > 0) {
        const newCatPromises = missingCategories.map((cat, index) => {
             return pb.collection('transaction_categories').create({
                user: user.id,
                name: cat.name,
                sub_categories: cat.sub_categories,
                order: localResult.length + index, // On ajoute à la fin avec un ordre incrémental
                is_system: true // Verrouillé par défaut car géré par l'admin
            }, { requestKey: null }).catch(e => {
                console.warn("Erreur création catégorie auto:", cat.name, e)
                return null // En cas d'erreur, on retourne null pour ne pas casser Promise.all
            })
        })
        const results = await Promise.all(newCatPromises)
        const createdCats = results.filter(c => c !== null)
        categories.value = [...localResult, ...createdCats].sort((a, b) => a.order - b.order)
      }

      // 4. Gestion des orphelins : Si l'admin a supprimé une catégorie, on déverrouille la copie locale
      const orphanedCats = categories.value.filter(local => 
          local.is_system && 
          !systemResult.some(sys => sys.name === local.name)
      )

      if (orphanedCats.length > 0) {
          const updatePromises = orphanedCats.map(cat => {
              return pb.collection('transaction_categories').update(cat.id, { is_system: false }, { requestKey: null }).catch(() => null)
          })
          await Promise.all(updatePromises)
          orphanedCats.forEach(cat => cat.is_system = false)
      }

      initialized.value = true

      // Abonnement Temps Réel : Si l'admin modifie les modèles, on re-synchronise immédiatement
      if (!subscribed.value) {
        subscribed.value = true
        pb.collection('categories').subscribe('*', async () => {
            await fetchCategories(true)
        }).catch(err => {
            console.warn("Impossible de souscrire aux mises à jour des catégories", err)
        })
      }
    } catch (e) {
      console.error("Erreur chargement catégories", e)
    } finally {
      loading.value = false
    }
  }

  const categoryOptions = computed(() => categories.value.map(c => ({ label: c.name, value: c.name })))

  return {
    categories,
    loading,
    fetchCategories,
    categoryOptions
  }
}