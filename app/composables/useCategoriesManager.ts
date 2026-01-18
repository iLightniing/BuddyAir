import { ref } from 'vue'

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
    is_system: false
  })

  // --- Initialisation & Récupération ---
  const init = async () => {
    loading.value = true
    try {
      if (isAdminMode) {
        // Admin : On gère la collection 'categories' (Globales)
        const records = await pb.collection('categories').getFullList({
          sort: '+order'
        })
        categoriesList.value = records.map(r => ({ ...r, is_system: true }))
      } else {
        // User : On force la synchronisation via le composable principal
        const { fetchCategories, categories: syncedCats } = useCategories()
        await fetchCategories(true)
        
        categoriesList.value = JSON.parse(JSON.stringify(syncedCats.value))
      }

    } catch (e) {
      console.error("Erreur chargement catégories:", e)
    } finally {
      loading.value = false
    }
  }

  // --- Actions ---

  const openModal = (category: any = null) => {
    // Sécurité : Empêcher l'édition d'une catégorie système par un utilisateur
    if (category && !isAdminMode && category.is_system) {
        return
    }

    if (category) {
      categoryForm.value = JSON.parse(JSON.stringify(category))
      // IMPORTANT : Si le champ JSON est vide en BDD, il peut être null. On force un tableau vide.
      if (!Array.isArray(categoryForm.value.sub_categories)) {
          categoryForm.value.sub_categories = []
      }
    } else {
      categoryForm.value = { id: '', name: '', sub_categories: [], is_system: isAdminMode }
    }
    showModal.value = true
  }

  const handleSaveCategory = async (categoryData: any) => {
      categoryForm.value = JSON.parse(JSON.stringify(categoryData))
      await saveCategory()
  }

  const saveCategory = async () => {
    try {
      const isCreation = !categoryForm.value.id
      
      const data = {
        name: categoryForm.value.name,
        sub_categories: JSON.parse(JSON.stringify(categoryForm.value.sub_categories || [])), // Nettoyage des Proxies pour l'enregistrement JSON
        user: isAdminMode ? null : currentUser.value?.id,
        is_system: isAdminMode ? true : categoryForm.value.is_system, // On préserve le statut système si existant
        order: isCreation ? categoriesList.value.length : undefined // On ajoute à la fin si création
      }
      
      // Nettoyage si order est undefined
      if (data.order === undefined) delete (data as any).order

      const collectionName = isAdminMode ? 'categories' : 'transaction_categories'

      let record
      if (!isCreation) {
        record = await pb.collection(collectionName).update(categoryForm.value.id, data)
        // Mise à jour locale immédiate (Modification)
        const index = categoriesList.value.findIndex(c => c.id === categoryForm.value.id)
        if (index !== -1) {
            categoriesList.value[index] = { ...categoriesList.value[index], ...record }
        }
      } else {
        record = await pb.collection(collectionName).create(data)
        // Mise à jour locale immédiate (Ajout)
        categoriesList.value.push({ ...record, is_system: isAdminMode })
      }

      showModal.value = false
      
      // Si on est en mode User, on met à jour le state global pour que les autres composants (modales) voient le changement
      if (!isAdminMode) {
          const { categories } = useCategories()
          categories.value = JSON.parse(JSON.stringify(categoriesList.value))
      }
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

    // Sécurité : Un utilisateur ne peut pas supprimer une catégorie système
    if (!isAdminMode && categoryToDelete.value.is_system) {
        return
    }

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

  const updateOrder = async () => {
    const collectionName = isAdminMode ? 'categories' : 'transaction_categories'
    const promises = categoriesList.value.map((item, index) => {
        if (item.order !== index) {
            item.order = index
            return pb.collection(collectionName).update(item.id, { order: index })
        }
        return Promise.resolve()
    })
    try {
        await Promise.all(promises)
        if (!isAdminMode) {
             const { categories } = useCategories()
             categories.value = JSON.parse(JSON.stringify(categoriesList.value))
        }
    } catch (e) { console.error(e) }
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
    handleSaveCategory,
    saveCategory,
    requestDelete,
    confirmDelete
  }
}