import { ref, computed } from 'vue'
import { DEFAULT_PAYMENT_METHODS } from '~/utils/constants'

export const usePaymentMethods = () => {
  const pb = usePocketBase()
  
  // State global partagé
  const paymentMethods = useState<any[]>('payment_methods', () => [])
  const loading = useState<boolean>('payment_methods_loading', () => false)
  const initialized = useState<boolean>('payment_methods_initialized', () => false)

  const fetchPaymentMethods = async () => {
    if (initialized.value && paymentMethods.value.length > 0) return
    
    loading.value = true
    const user = pb.authStore.model
    if (!user) return

    try {
      const result = await pb.collection('payment_methods').getFullList({
        sort: '+order',
      })

      if (result.length === 0) {
        await initializeDefaults(user.id)
      } else {
        paymentMethods.value = result
      }
      initialized.value = true
    } catch (e) {
      // Fallback local si la collection n'existe pas encore
      if (paymentMethods.value.length === 0) {
         paymentMethods.value = DEFAULT_PAYMENT_METHODS.map((pm, index) => ({
          id: 'local_' + index,
          ...pm,
          order: index
        }))
      }
    } finally {
      loading.value = false
    }
  }

  const initializeDefaults = async (userId: string) => {
    try {
        const promises = DEFAULT_PAYMENT_METHODS.map((pm, index) => {
        return pb.collection('payment_methods').create({
            user: userId,
            name: pm.name,
            code: pm.code,
            icon: pm.icon,
            order: index
        })
        })
        const results = await Promise.all(promises)
        paymentMethods.value = results.sort((a, b) => a.order - b.order)
    } catch (e) {
        console.error("Impossible d'initialiser les moyens de paiement par défaut", e)
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