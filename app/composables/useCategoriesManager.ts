import { ref } from 'vue'
import { mergeCategories } from '~/utils/categoryHelpers'

export const useCategoriesManager = (isAdminMode = false) => {
  const pb = usePocketBase()
  const currentUser = usePocketBaseUser()
  
  const categoriesList = ref<any[]>([])
  const loading = ref(false)

  // Modales
  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const categoryToDelete = ref<any>(null)
  
  // Formulaire
  const categoryForm = ref({
    id: '',
    name: '',
    sub_categories: [] as string[],
    is_global: false
  })

  // --- Initialisation & Récupération ---
  const init = async () => {
    loading.value = true
    try {
      if (isAdminMode) {
        // Admin : On gère la collection 'categories' (Globales)
        const records = await pb.collection('categories').getFullList({
          sort: '+name'
        })
        categoriesList.value = records.map(r => ({ ...r, is_global: true, locked_subs: [] }))
      } else {
        // User : On récupère les globales ET les locales
        const globalRecords = await pb.collection('categories').getFullList({
          sort: '+name'
        })
        
        const localRecords = currentUser.value ? await pb.collection('transaction_categories').getFullList({
          filter: `user = "${currentUser.value.id}"`,
          sort: '+name'
        }) : []

        // Utilisation de la fonction utilitaire extraite
        categoriesList.value = mergeCategories(globalRecords, localRecords)
      }

    } catch (e) {
      console.error("Erreur chargement catégories:", e)
    } finally {
      loading.value = false
    }
  }

  // --- Actions ---

  const openModal = (category: any = null) => {
    if (category) {
      categoryForm.value = JSON.parse(JSON.stringify(category))
      if (!isAdminMode && !category.id && category.global_id) {
          categoryForm.value.id = '' 
      }
    } else {
      categoryForm.value = { id: '', name: '', sub_categories: [], is_global: isAdminMode }
    }
    showModal.value = true
  }

  // Action générique pour sauvegarder une catégorie (appelée par le composant carte)
  const handleSaveCategory = async (categoryData: any) => {
      // On prépare le formulaire avec les données reçues
      categoryForm.value = JSON.parse(JSON.stringify(categoryData))
      // Si c'est une globale pure (pas d'ID local), on s'assure que l'ID est vide pour créer une copie
      if (!isAdminMode && !categoryData.id && categoryData.global_id) {
          categoryForm.value.id = ''
      }
      await saveCategory()
  }

  const saveCategory = async () => {
    try {
      const data = {
        name: categoryForm.value.name,
        sub_categories: categoryForm.value.sub_categories,
        user: isAdminMode ? null : currentUser.value?.id,
        is_system: isAdminMode
      }
      
      const collectionName = isAdminMode ? 'categories' : 'transaction_categories'

      if (categoryForm.value.id) {
        await pb.collection(collectionName).update(categoryForm.value.id, data)
      } else {
        await pb.collection(collectionName).create(data)
      }

      showModal.value = false
      await init()
    } catch (e) {
      console.error("Erreur sauvegarde:", e)
    }
  }

  const requestDelete = (category: any) => {
    categoryToDelete.value = category
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!categoryToDelete.value) return

    try {
        const idToDelete = categoryToDelete.value.id
        
        if (isAdminMode) {
             if (idToDelete) await pb.collection('categories').delete(idToDelete)
        } else {
             if (idToDelete) await pb.collection('transaction_categories').delete(idToDelete)
        }
        
        showDeleteModal.value = false
        categoryToDelete.value = null
        await init()
    } catch (e) {
        console.error("Erreur suppression:", e)
    }
  }

  const updateOrder = () => {
    // Logique de tri des catégories parents si nécessaire
  }

  return {
    categoriesList,
    loading,
    showModal,
    categoryForm,
    showDeleteModal,
    categoryToDelete,
    init,
    updateOrder,
    openModal,
    saveCategory,
    handleSaveCategory, // Nouvelle méthode exposée
    requestDelete,
    confirmDelete
  }
}