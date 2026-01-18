import { ref, computed } from 'vue'

export const usePaymentMethods = () => {
  const pb = usePocketBase()
  
  // State global partagé
  const paymentMethods = useState<any[]>('payment_methods', () => [])
  const loading = useState<boolean>('payment_methods_loading', () => false)
  const initialized = useState<boolean>('payment_methods_initialized', () => false)
  const subscribed = useState<boolean>('payment_methods_subscribed', () => false)

  const fetchPaymentMethods = async (force = false) => {
    if (loading.value) return // Évite les appels concurrents
    if (!force && initialized.value && paymentMethods.value.length > 0) return
    
    loading.value = true
    const user = pb.authStore.model
    if (!user) return

    try {
      // 1. Récupérer les méthodes locales (User)
      const localResult = await pb.collection('payment_methods').getFullList({
        sort: '+order',
      })
      
      // On affiche immédiatement ce qu'on a localement pour ne pas laisser l'utilisateur avec une liste vide
      paymentMethods.value = localResult

      // 2. Récupérer les méthodes système (Admin) pour la synchro
      // On le fait systématiquement pour détecter les NOUVEAUX moyens de paiement ajoutés par l'admin
      let systemResult: any[] = []
      try {
        systemResult = await pb.collection('system_payment_methods').getFullList({
          sort: '+order',
        })
      } catch (err) {
        // Si l'accès est refusé (API Rules) ou collection inexistante, on arrête la synchro silencieusement
        // Si la liste est vide, on ajoute un fallback minimal pour que l'interface ne soit pas cassée
        if (paymentMethods.value.length === 0) {
            paymentMethods.value = [
                { id: 'local_1', name: 'Espèces', code: 'cash', icon: 'lucide:coins', type: 'both', is_system: false },
                { id: 'local_2', name: 'Carte Bancaire', code: 'card', icon: 'lucide:credit-card', type: 'debit', is_system: false }
            ]
        }
        return 
      }

      // 3. Synchro : Identifier et créer les méthodes manquantes
      // On compare par 'name' (ou 'code' si vous préférez) pour éviter les doublons
      const missingMethods = systemResult.filter(sysMethod => 
        !localResult.some(localMethod => 
            (localMethod.code && localMethod.code === sysMethod.code) || 
            localMethod.name === sysMethod.name
        )
      )

      if (missingMethods.length > 0) {
        const newMethodsPromises = missingMethods.map((pm, index) => {
             return pb.collection('payment_methods').create({
                user: user.id,
                name: pm.name,
                code: pm.code,
                icon: pm.icon,
                order: localResult.length + index, // On ajoute à la fin avec un ordre incrémental
                type: pm.type,
                is_system: true // Verrouillé par défaut car géré par l'admin
            }, { requestKey: null }).catch(e => {
                console.warn("Erreur création paiement auto:", pm.name, e)
                return null
            })
        })
        // On attend la création des nouvelles méthodes
        const results = await Promise.all(newMethodsPromises)
        const createdMethods = results.filter(r => r !== null)
        // On met à jour la liste locale avec les nouvelles méthodes
        paymentMethods.value = [...localResult, ...createdMethods].sort((a, b) => a.order - b.order)
      } else {
        // Rien à synchroniser, on affiche ce qu'on a
        paymentMethods.value = localResult
      }
      
      // 4. Gestion des orphelins : Si l'admin a supprimé un modèle, on déverrouille la copie locale
      const orphanedMethods = paymentMethods.value.filter(local => 
          local.is_system && 
          !systemResult.some(sys => 
              (sys.code && sys.code === local.code) || sys.name === local.name
          )
      )

      if (orphanedMethods.length > 0) {
          const updatePromises = orphanedMethods.map(pm => {
              return pb.collection('payment_methods').update(pm.id, { is_system: false }, { requestKey: null }).catch(() => null)
          })
          await Promise.all(updatePromises)
          // Mise à jour locale immédiate pour l'affichage
          orphanedMethods.forEach(pm => pm.is_system = false)
      }

      initialized.value = true

      // Abonnement Temps Réel : Si l'admin modifie les modèles, on re-synchronise immédiatement
      if (!subscribed.value) {
        subscribed.value = true
        pb.collection('system_payment_methods').subscribe('*', async () => {
            await fetchPaymentMethods(true)
        }).catch(err => {
            console.warn("Impossible de souscrire aux mises à jour des paiements", err)
        })
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des méthodes de paiement", e)
    } finally {
      loading.value = false
    }
  }

  const paymentMethodOptions = computed(() => paymentMethods.value.map(pm => ({ 
    label: pm.name, 
    value: pm.code 
  })))

  const getPaymentMethodLabel = (code: string) => {
    const pm = paymentMethods.value.find(p => p.code === code)
    return pm ? pm.name : code
  }

  const getPaymentMethodIcon = (code: string) => {
    const pm = paymentMethods.value.find(p => p.code === code)
    return pm ? pm.icon : 'lucide:circle-dashed'
  }

  return {
    paymentMethods,
    loading,
    fetchPaymentMethods,
    paymentMethodOptions,
    getPaymentMethodLabel,
    getPaymentMethodIcon
  }
}