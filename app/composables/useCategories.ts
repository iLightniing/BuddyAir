import { ref, computed } from 'vue'
import { DEFAULT_CATEGORIES } from '~/utils/constants'

export const useCategories = () => {
  const pb = usePocketBase()
  
  // State global partagé
  const categories = useState<any[]>('categories', () => [])
  const loading = useState<boolean>('categories_loading', () => false)
  const initialized = useState<boolean>('categories_initialized', () => false)

  const fetchCategories = async () => {
    if (initialized.value && categories.value.length > 0) return
    
    loading.value = true
    const user = pb.authStore.model
    if (!user) return

    try {
      const result = await pb.collection('transaction_categories').getFullList({
        sort: '+order',
      })

      if (result.length === 0) {
        await initializeDefaults(user.id)
      } else {
        categories.value = result
      }
      initialized.value = true
    } catch (e) {
      console.error("Erreur chargement catégories (Collection 'transaction_categories' manquante ?)", e)
      // Fallback local pour que l'app fonctionne même sans la collection
      if (categories.value.length === 0) {
         categories.value = Object.entries(DEFAULT_CATEGORIES).map(([name, subs], index) => ({
          id: 'local_' + index,
          name,
          sub_categories: subs,
          order: index
        }))
      }
    } finally {
      loading.value = false
    }
  }

  const initializeDefaults = async (userId: string) => {
    try {
        const promises = Object.entries(DEFAULT_CATEGORIES).map(([name, subs], index) => {
        return pb.collection('transaction_categories').create({
            user: userId,
            name,
            sub_categories: subs,
            order: index
        })
        })
        const results = await Promise.all(promises)
        categories.value = results.sort((a, b) => a.order - b.order)
    } catch (e) {
        console.error("Impossible d'initialiser les catégories par défaut", e)
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