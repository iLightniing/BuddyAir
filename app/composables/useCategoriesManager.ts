export const useCategoriesManager = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const { categories, fetchCategories } = useCategories()

  const showModal = ref(false)
  const categoryForm = ref({
    id: '',
    name: '',
    sub_categories: [] as string[]
  })
  const newSubCategoryName = ref('')

  const showDeleteModal = ref(false)
  const categoryToDelete = ref<any>(null)

  const categoriesList = ref<any[]>([])

  const init = async () => {
    await fetchCategories()
    categoriesList.value = [...categories.value]
  }

  const updateOrder = async () => {
    // Mise à jour de l'ordre dans la base
    const promises = categoriesList.value.map((cat, index) => {
      return pb.collection('transaction_categories').update(cat.id, { order: index })
    })
    try {
      await Promise.all(promises)
      categories.value = categoriesList.value // Mise à jour du state global
    } catch (e) {
      console.error("Erreur sauvegarde ordre", e)
    }
  }

  const openModal = (cat?: any) => {
    if (cat) {
      categoryForm.value = {
        id: cat.id,
        name: cat.name,
        sub_categories: [...(cat.sub_categories || [])]
      }
    } else {
      categoryForm.value = {
        id: '',
        name: '',
        sub_categories: []
      }
    }
    newSubCategoryName.value = ''
    showModal.value = true
  }

  const saveCategory = async () => {
    if (!categoryForm.value.name) return

    try {
      if (categoryForm.value.id) {
        // Update
        await pb.collection('transaction_categories').update(categoryForm.value.id, {
          name: categoryForm.value.name,
          sub_categories: categoryForm.value.sub_categories
        })
        // Update local state
        const index = categories.value.findIndex(c => c.id === categoryForm.value.id)
        if (index !== -1) {
          categories.value[index] = { ...categories.value[index], name: categoryForm.value.name, sub_categories: categoryForm.value.sub_categories }
          categoriesList.value = [...categories.value]
        }
        notify("Catégorie modifiée", "success")
      } else {
        // Create
        const user = pb.authStore.model
        const newCat = await pb.collection('transaction_categories').create({
          user: user?.id,
          name: categoryForm.value.name,
          sub_categories: categoryForm.value.sub_categories,
          order: categoriesList.value.length
        })
        categories.value.push(newCat)
        categoriesList.value = [...categories.value]
        notify("Catégorie ajoutée", "success")
      }
      showModal.value = false
    } catch (e) {
      notify("Erreur lors de l'enregistrement", "error")
    }
  }

  const addSubCategory = () => {
    if (!newSubCategoryName.value) return
    if (categoryForm.value.sub_categories.includes(newSubCategoryName.value)) {
      notify("Cette sous-catégorie existe déjà", "error")
      return
    }
    categoryForm.value.sub_categories.push(newSubCategoryName.value)
    newSubCategoryName.value = ''
  }

  const removeSubCategory = (index: number) => {
    categoryForm.value.sub_categories.splice(index, 1)
  }

  const requestDelete = (cat: any) => {
    categoryToDelete.value = cat
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!categoryToDelete.value) return
    try {
      await pb.collection('transaction_categories').delete(categoryToDelete.value.id)
      categories.value = categories.value.filter(c => c.id !== categoryToDelete.value.id)
      categoriesList.value = [...categories.value]
      notify("Catégorie supprimée", "success")
      if (categoryForm.value.id === categoryToDelete.value.id) showModal.value = false
      showDeleteModal.value = false
    } catch (e) {
      notify("Erreur suppression", "error")
    }
  }

  return {
    categoriesList, showModal, categoryForm, newSubCategoryName, showDeleteModal, categoryToDelete,
    init, updateOrder, openModal, saveCategory, addSubCategory, removeSubCategory, requestDelete, confirmDelete
  }
}