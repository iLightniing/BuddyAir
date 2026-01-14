import { slugify } from '~/utils/string'

export const usePaymentMethodsManager = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const { paymentMethods, fetchPaymentMethods } = usePaymentMethods()

  const showModal = ref(false)
  const form = ref({
    id: '',
    name: '',
    code: '',
    icon: 'lucide:credit-card'
  })

  const showDeleteModal = ref(false)
  const itemToDelete = ref<any>(null)

  const icons = [
    'lucide:credit-card', 'lucide:banknote', 'lucide:landmark', 'lucide:arrow-right-left',
    'lucide:scroll-text', 'lucide:wallet', 'lucide:smartphone', 'lucide:bitcoin',
    'lucide:gift', 'lucide:shopping-cart', 'lucide:more-horizontal'
  ]

  const init = async () => {
    await fetchPaymentMethods()
  }

  const updateOrder = async () => {
    const promises = paymentMethods.value.map((pm, index) => {
      return pb.collection('payment_methods').update(pm.id, { order: index })
    })
    try { await Promise.all(promises) } catch (e) {}
  }

  const openModal = (item?: any) => {
    if (item) {
      form.value = {
        id: item.id,
        name: item.name,
        code: item.code,
        icon: item.icon
      }
    } else {
      form.value = {
        id: '',
        name: '',
        code: '',
        icon: 'lucide:credit-card'
      }
    }
    showModal.value = true
  }

  const save = async () => {
    if (!form.value.name) return

    try {
      // Génération automatique du code si vide ou nouveau
      let code = form.value.code
      if (!code) {
          code = slugify(form.value.name)
      }

      const data = {
        name: form.value.name,
        code: code,
        icon: form.value.icon
      }

      if (form.value.id) {
        await pb.collection('payment_methods').update(form.value.id, data)
        notify("Moyen de paiement modifié", "success")
      } else {
        const user = pb.authStore.model
        await pb.collection('payment_methods').create({
          ...data,
          user: user?.id,
          order: paymentMethods.value.length
        })
        notify("Moyen de paiement ajouté", "success")
      }
      
      // Rafraîchir la liste locale
      const result = await pb.collection('payment_methods').getFullList({ sort: '+order' })
      paymentMethods.value = result
      
      showModal.value = false
    } catch (e) {
      notify("Erreur lors de l'enregistrement", "error")
    }
  }

  const requestDelete = (item: any) => {
    // Protection des méthodes système de base pour éviter de casser la logique de virement
    if (['transfer'].includes(item.code)) {
        notify("Ce moyen de paiement système ne peut pas être supprimé.", "error")
        return
    }
    itemToDelete.value = item
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!itemToDelete.value) return
    try {
      await pb.collection('payment_methods').delete(itemToDelete.value.id)
      paymentMethods.value = paymentMethods.value.filter(p => p.id !== itemToDelete.value.id)
      notify("Supprimé avec succès", "success")
      showDeleteModal.value = false
    } catch (e) {
      notify("Erreur suppression", "error")
    }
  }

  return {
    paymentMethods, showModal, form, showDeleteModal, itemToDelete, icons,
    init, updateOrder, openModal, save, requestDelete, confirmDelete
  }
}