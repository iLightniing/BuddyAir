import { useBudget } from '@/composables/useBudget'

export const useBudgetManager = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const user = usePocketBaseUser()
  
  // Intégration de useBudget
  const { 
    loading, currentDate, prevMonth, nextMonth, resetDate, fetchData, 
    budgetStats, globalStats, dailySafeSpend, isCurrentMonth, sortBy,
    transactions
  } = useBudget()

  // Intégration de useCategories
  const { categoryOptions, fetchCategories } = useCategories()

  // --- Gestion Drag & Drop ---
  const orderedBudgets = ref<any[]>([])

  watch(budgetStats, (newVal) => {
    orderedBudgets.value = [...newVal]
  }, { immediate: true })

  const updateOrder = async () => {
    try {
      const promises = orderedBudgets.value.map((b: any, index: number) => {
         return pb.collection('budgets').update(b.id, { order: index })
      })
      await Promise.all(promises)
      
      // Basculer sur le tri manuel pour voir le résultat
      if (sortBy.value !== 'order') sortBy.value = 'order'
    } catch(e) {
      // Silencieux si le champ order n'existe pas encore
    }
  }

  // --- Formulaire ---
  const showModal = ref(false)
  const editingBudget = ref<any>(null)
  const showDeleteModal = ref(false)
  const budgetToDelete = ref<any>(null)
  const showViewModal = ref(false)
  const viewingBudget = ref<any>(null)
  const form = ref({
    category: '',
    amount: ''
  })

  const sortOptions = [
    { label: 'Manuel', value: 'order' },
    { label: 'Urgence (Progression)', value: 'progress-desc' },
    { label: 'Dépenses (Haut → Bas)', value: 'spent-desc' },
    { label: 'Budget (Haut → Bas)', value: 'amount-desc' },
    { label: 'Alphabétique', value: 'category' },
  ]

  const viewingTransactions = computed(() => {
    if (!viewingBudget.value) return []
    return transactions.value.filter((t: any) => t.category === viewingBudget.value.category).map((t: any) => ({ ...t }))
  })

  // --- Actions ---
  const openModal = (budget: any = null) => {
    editingBudget.value = budget
    if (budget) {
      form.value = {
        category: budget.category,
        amount: budget.amount.toString()
      }
    } else {
      form.value = { category: '', amount: '' }
    }
    showModal.value = true
  }

  const openViewModal = (budget: any) => {
    viewingBudget.value = budget
    showViewModal.value = true
  }

  const saveBudget = async () => {
    if (!user.value) return
    
    try {
      const data = {
        user: user.value.id,
        category: form.value.category,
        amount: parseFloat(form.value.amount)
      }

      if (editingBudget.value) {
        await pb.collection('budgets').update(editingBudget.value.id, data)
        notify('Budget mis à jour', 'success')
      } else {
        const existing = budgetStats.value.find((b: any) => b.category === data.category)
        if (existing) {
          notify('Un budget existe déjà pour cette catégorie', 'error')
          return
        }
        await pb.collection('budgets').create(data)
        notify('Budget créé', 'success')
      }
      
      showModal.value = false
      fetchData()
    } catch (e) {
      notify('Erreur lors de l\'enregistrement', 'error')
    }
  }

  const deleteBudget = (budget: any) => {
    budgetToDelete.value = budget
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!budgetToDelete.value) return
    try {
      await pb.collection('budgets').delete(budgetToDelete.value.id)
      notify('Budget supprimé', 'success')
      showDeleteModal.value = false
      fetchData()
    } catch (e) {
      notify('Erreur lors de la suppression', 'error')
    }
  }

  const init = () => {
    fetchCategories()
    fetchData()
  }

  return {
    loading, currentDate, prevMonth, nextMonth, resetDate,
    budgetStats, globalStats, dailySafeSpend, isCurrentMonth, sortBy,
    orderedBudgets, updateOrder,
    showModal, editingBudget, showDeleteModal, budgetToDelete, showViewModal, viewingBudget, form,
    sortOptions, categoryOptions, viewingTransactions,
    openModal, openViewModal, saveBudget, deleteBudget, confirmDelete, init, currentMonthLabel: computed(() => currentDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
  }
}