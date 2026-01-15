import { ref } from 'vue'
import { mergePaymentMethods } from '~/utils/paymentMethodHelpers'

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
    is_global: false,
    code: ''
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
          sort: '+name'
        })
        paymentMethods.value = records.map(r => ({ ...r, is_global_source: true }))
      } else {
        // User : On récupère les globales (System) ET les locales (User)
        const globalRecords = await pb.collection('system_payment_methods').getFullList({
          sort: '+name'
        })
        
        const localRecords = currentUser.value ? await pb.collection('payment_methods').getFullList({
          filter: `user = "${currentUser.value.id}"`,
          sort: '+name'
        }) : []

        paymentMethods.value = mergePaymentMethods(globalRecords, localRecords)
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
      // Si c'est une globale pure (pas d'ID local), on s'assure que l'ID est vide pour créer une copie
      if (!isAdminMode && !item.id && item.global_id) {
          form.value.id = '' 
          form.value.code = ''
      }
    } else {
      form.value = { id: '', name: '', icon: 'lucide:credit-card', is_global: isAdminMode, code: '' }
    }
    showModal.value = true
  }

  // Action générique pour sauvegarder (appelée par le composant carte pour l'édition inline)
  const handleSaveMethod = async (itemData: any) => {
      form.value = JSON.parse(JSON.stringify(itemData))
      if (!isAdminMode && !itemData.id && itemData.global_id) {
          form.value.id = ''
          // Générer un code si manquant lors de la conversion global -> local
          if (!(form.value as any).code) {
             (form.value as any).code = form.value.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
          }
      }
      await save()
  }

  const save = async () => {
    try {
      const collectionName = isAdminMode ? 'system_payment_methods' : 'payment_methods'
      
      const data: any = {
        name: form.value.name,
        icon: form.value.icon,
      }
      
      if (!isAdminMode) {
          data.user = currentUser.value?.id
          // Génération du code (slug) si non présent ou vide
          if (!(form.value as any).code) {
             data.code = form.value.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
          } else {
             data.code = (form.value as any).code
          }
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

  const updateOrder = () => {
    // Logique de tri si nécessaire
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