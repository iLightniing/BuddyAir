export const useScheduleActions = (fetchItems: () => Promise<void>) => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  
  // Edit
  const showModal = ref(false)
  const itemToEdit = ref<any>(null)
  const handleEdit = (item: any) => {
    itemToEdit.value = item
    showModal.value = true
  }

  // Delete
  const showDeleteModal = ref(false)
  const itemToDelete = ref<any>(null)
  const handleDelete = (item: any) => {
    itemToDelete.value = item
    showDeleteModal.value = true
  }
  const confirmDelete = async () => {
    if (!itemToDelete.value) return
    try {
      await pb.collection('scheduled_transactions').delete(itemToDelete.value.id)
      notify('Échéance supprimée', 'success')
      showDeleteModal.value = false
      fetchItems()
    } catch (e) {
      notify('Erreur lors de la suppression', 'error')
    }
  }

  // Force
  const showForceModal = ref(false)
  const itemToForce = ref<any>(null)
  const forceDate = ref({ month: new Date().getMonth(), year: new Date().getFullYear() })
  const loadingAction = ref(false)

  const handleForce = (item: any) => {
    itemToForce.value = item
    const now = new Date()
    forceDate.value = { month: now.getMonth(), year: now.getFullYear() }
    showForceModal.value = true
  }

  const confirmForce = async () => {
    if (!itemToForce.value) return
    loadingAction.value = true
    
    try {
      const user = pb.authStore.model
      const targetDate = new Date(forceDate.value.year, forceDate.value.month, itemToForce.value.day_of_month || 1)
      
      const startOfMonth = new Date(forceDate.value.year, forceDate.value.month, 1).toISOString()
      const endOfMonth = new Date(forceDate.value.year, forceDate.value.month + 1, 0).toISOString()
      
      const existing = await pb.collection('transactions').getList(1, 1, {
        filter: `account = "${itemToForce.value.account}" && amount = ${itemToForce.value.amount} && date >= "${startOfMonth}" && date <= "${endOfMonth}"`,
        requestKey: null
      })

      if (existing.totalItems > 0) {
        notify('Une transaction similaire existe déjà pour ce mois.', 'info')
        loadingAction.value = false
        return
      }

      const txData = {
        user: user?.id,
        account: itemToForce.value.account,
        type: itemToForce.value.type,
        amount: itemToForce.value.amount,
        description: itemToForce.value.description,
        category: itemToForce.value.category,
        sub_category: itemToForce.value.sub_category,
        payment_method: itemToForce.value.payment_method || 'direct_debit',
        date: targetDate.toISOString(),
        status: 'pending',
        is_recurring: true,
        transfer_account: itemToForce.value.transfer_account || ''
      }

      const createdTx = await pb.collection('transactions').create(txData)

      const sourceAccount = await pb.collection('accounts').getOne(itemToForce.value.account)
      const amountChange = itemToForce.value.type === 'expense' ? -Number(itemToForce.value.amount) : Number(itemToForce.value.amount)
      await pb.collection('accounts').update(itemToForce.value.account, {
          current_balance: sourceAccount.current_balance + amountChange
      })

      if (itemToForce.value.payment_method === 'transfer' && itemToForce.value.transfer_account) {
         const targetTxData = { ...txData, account: itemToForce.value.transfer_account, type: itemToForce.value.type === 'expense' ? 'income' : 'expense', payment_method: 'transfer', related_transaction: createdTx.id }
         
         const mirrorTx = await pb.collection('transactions').create(targetTxData)
         await pb.collection('transactions').update(createdTx.id, { related_transaction: mirrorTx.id })

         const targetAccount = await pb.collection('accounts').getOne(itemToForce.value.transfer_account)
         const targetAmountChange = targetTxData.type === 'expense' ? -Number(targetTxData.amount) : Number(targetTxData.amount)
         await pb.collection('accounts').update(itemToForce.value.transfer_account, {
             current_balance: targetAccount.current_balance + targetAmountChange
         })
      }

      notify('Échéance forcée avec succès', 'success')
      showForceModal.value = false
    } catch (e: any) {
      notify(e.message || "Erreur lors du forçage", "error")
    } finally {
      loadingAction.value = false
    }
  }

  return {
    showModal, itemToEdit, handleEdit,
    showDeleteModal, itemToDelete, handleDelete, confirmDelete,
    showForceModal, itemToForce, forceDate, handleForce, confirmForce,
    loadingAction
  }
}