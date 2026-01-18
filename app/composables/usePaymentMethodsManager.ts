import { ref } from 'vue'

export const usePaymentMethodsManager = (isAdminMode = false) => {
  const pb = usePocketBase()
  const currentUser = usePocketBaseUser()
  
  const paymentMethods = ref<any[]>([])
  const loading = ref(false)

  // Modales
  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const itemToDelete = ref<any>(null)
  
  // Formulaire
  const form = ref({
    id: '',
    name: '',
    icon: 'lucide:credit-card',
    is_system: false,
    code: '',
    type: 'both'
  })

  const icons = [
    'lucide:credit-card', 'lucide:banknote', 'lucide:wallet', 
    'lucide:smartphone', 'lucide:landmark', 'lucide:coins',
    'lucide:bitcoin', 'lucide:gift', 'lucide:piggy-bank',
    'lucide:shopping-cart', 'lucide:qr-code', 'lucide:receipt'
  ]

  // --- Initialisation & Récupération ---
  const init = async () => {
    loading.value = true
    try {
      if (isAdminMode) {
        // Admin : On gère la collection 'system_payment_methods' (Globales)
        const records = await pb.collection('system_payment_methods').getFullList({
          sort: '+order'
        })
        paymentMethods.value = records.map(r => ({ ...r, is_system: true }))
      } else {
        // User : On force la synchronisation via le composable principal pour récupérer les nouveautés Admin
        const { fetchPaymentMethods, paymentMethods: syncedMethods } = usePaymentMethods()
        await fetchPaymentMethods(true) // true = forcer la vérification
        
        // On copie les données synchronisées pour l'affichage local
        paymentMethods.value = JSON.parse(JSON.stringify(syncedMethods.value))
      }

    } catch (e) {
      console.error("Erreur chargement modes de paiement:", e)
    } finally {
      loading.value = false
    }
  }

  // --- Actions ---

  const openModal = (item: any = null) => {
    if (item) {
      form.value = JSON.parse(JSON.stringify(item))
    } else {
      form.value = { id: '', name: '', icon: 'lucide:credit-card', is_system: isAdminMode, code: '', type: 'both' }
    }
    showModal.value = true
  }

  // Action générique pour sauvegarder (appelée par le composant carte pour l'édition inline)
  const handleSaveMethod = async (itemData: any) => {
      form.value = JSON.parse(JSON.stringify(itemData))
      await save()
  }

  const save = async () => {
    try {
      const collectionName = isAdminMode ? 'system_payment_methods' : 'payment_methods'
      
      const data: any = {
        name: form.value.name,
        icon: form.value.icon,
        type: form.value.type || 'both',
        is_system: isAdminMode // Admin = true, User = false (toujours, car c'est une copie)
      }
      
      // Gestion du code (requis) pour Admin ET User
      // Si le code est présent dans le formulaire, on l'utilise.
      // Sinon, on le génère à partir du nom.
      let code = (form.value as any).code
      if (!code && form.value.name) {
         code = form.value.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      }
      if (code) data.code = code

      if (!isAdminMode) {
          data.user = currentUser.value?.id
      }

      if (form.value.id) {
        await pb.collection(collectionName).update(form.value.id, data)
      } else {
        await pb.collection(collectionName).create(data)
      }

      showModal.value = false
      await init()
    } catch (e) {
      console.error("Erreur sauvegarde:", e)
    }
  }

  const requestDelete = (item: any) => {
    itemToDelete.value = item
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!itemToDelete.value) return

    try {
        const idToDelete = itemToDelete.value.id
        
        if (isAdminMode) {
             if (idToDelete) await pb.collection('system_payment_methods').delete(idToDelete)
        } else {
             if (idToDelete) await pb.collection('payment_methods').delete(idToDelete)
        }
        
        showDeleteModal.value = false
        itemToDelete.value = null
        await init()
    } catch (e) {
        console.error("Erreur suppression:", e)
    }
  }

  const updateOrder = async () => {
    const collectionName = isAdminMode ? 'system_payment_methods' : 'payment_methods'
    
    const promises = paymentMethods.value.map((item, index) => {
      if (item.order !== index) {
        item.order = index
        return pb.collection(collectionName).update(item.id, { order: index })
      }
      return Promise.resolve()
    })

    try {
      await Promise.all(promises)
      
      if (!isAdminMode) {
         const { paymentMethods: globalMethods } = usePaymentMethods()
         globalMethods.value = JSON.parse(JSON.stringify(paymentMethods.value))
      }
    } catch (e) {
      console.error("Erreur lors de la sauvegarde de l'ordre:", e)
    }
  }

  return {
    paymentMethods,
    loading,
    showModal,
    form,
    showDeleteModal,
    itemToDelete,
    icons,
    init,
    updateOrder,
    openModal,
    save,
    handleSaveMethod,
    requestDelete,
    confirmDelete
  }
}