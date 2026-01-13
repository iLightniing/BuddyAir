export function useTransactionActions(
  accountId: string,
  account: Ref<any>,
  transactions: Ref<any[]>,
  pendingTransactions: Ref<any[]>,
  filteredTransactions: Ref<any[]>,
  selectedTransactions: Ref<string[]>,
  currentDate: Ref<Date>,
  fetchData: () => Promise<void>
) {
  const pb = usePocketBase()
  const { notify } = useNotification()

  const showTransactionModal = ref(false)
  const transactionToEdit = ref<any>(null)
  const transactionToDuplicate = ref<any>(null)
  const showDeleteModal = ref(false)
  const transactionToDelete = ref<any>(null)
  const loading = ref(false)

  const handleEdit = (tx: any) => {
    transactionToEdit.value = tx
    transactionToDuplicate.value = null
    showTransactionModal.value = true
  }

  const handleDuplicate = (tx: any) => {
    transactionToDuplicate.value = { ...tx }
    transactionToEdit.value = null
    showTransactionModal.value = true
  }

  const confirmDelete = (tx: any) => {
    transactionToDelete.value = tx
    showTransactionModal.value = false
    showDeleteModal.value = true
  }

  const processDeleteTransaction = async (tx: any) => {
    if (tx.related_transaction) {
      try {
        const relatedTx = await pb.collection('transactions').getOne(tx.related_transaction)
        await pb.collection('transactions').delete(relatedTx.id)
        const relatedAccount = await pb.collection('accounts').getOne(relatedTx.account)
        const relatedAmount = relatedTx.type === 'expense' ? -Math.abs(relatedTx.amount) : Math.abs(relatedTx.amount)
        await pb.collection('accounts').update(relatedTx.account, { current_balance: relatedAccount.current_balance - relatedAmount })
      } catch (err) {}
    }
    await pb.collection('transactions').delete(tx.id)
    if (tx && account.value) {
      const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
      const newBalance = account.value.current_balance - amount
      account.value.current_balance = newBalance
      await pb.collection('accounts').update(accountId, { current_balance: newBalance })
    }
  }

  const handleDelete = async () => {
    if (!transactionToDelete.value) return
    try {
      await processDeleteTransaction(transactionToDelete.value)
      notify("Opération supprimée", "success")
      showDeleteModal.value = false
      fetchData()
    } catch (e) {
      notify("Erreur lors de la suppression", "error")
    }
  }

  const togglePointed = async (tx: any, checked?: boolean) => {
    try {
      const status = checked ? 'completed' : 'pending'
      const pointed_at = checked ? new Date().toISOString() : null
      await pb.collection('transactions').update(tx.id, { status, pointed_at })
      
      const sourceTx = transactions.value.find(t => t.id === tx.id)
      if (sourceTx) { sourceTx.status = status; sourceTx.pointed_at = pointed_at }
      
      if (tx.related_transaction) {
        try { await pb.collection('transactions').update(tx.related_transaction, { status, pointed_at }) } catch (err) {}
      }
      if (checked) pendingTransactions.value = pendingTransactions.value.filter(t => t.id !== tx.id)
      else pendingTransactions.value.push(tx)
      notify(checked ? "Opération pointée" : "Opération dépointée", "success")
    } catch (e) { notify("Erreur lors du pointage", "error") }
  }

  const handleBulkPoint = async (checked: boolean) => {
    loading.value = true
    try {
      await Promise.all(selectedTransactions.value.map(id => pb.collection('transactions').update(id, { status: checked ? 'completed' : 'pending', pointed_at: checked ? new Date().toISOString() : null })))
      notify(`${selectedTransactions.value.length} opérations mises à jour`, 'success')
      selectedTransactions.value = []
      fetchData()
    } catch (e) { notify('Erreur', 'error') } finally { loading.value = false }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer définitivement ${selectedTransactions.value.length} opérations ?`)) return
    loading.value = true
    try {
      const txsToDelete = transactions.value.filter(t => selectedTransactions.value.includes(t.id))
      for (const tx of txsToDelete) { await processDeleteTransaction(tx) }
      notify('Opérations supprimées', 'success')
      selectedTransactions.value = []
      fetchData()
    } catch (e) { notify('Erreur', 'error') } finally { loading.value = false }
  }

  const handleExport = () => {
    const headers = ['Date', 'Description', 'Catégorie', 'Type', 'Montant', 'Statut']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.value.map(tx => [
        new Date(tx.date).toLocaleDateString('fr-FR'),
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${(tx.category || '').replace(/"/g, '""')}"`,
        tx.type === 'expense' ? 'Dépense' : 'Revenu',
        tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
        tx.status === 'completed' ? 'Pointé' : 'En attente'
      ].join(','))
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `export_${account.value.name}_${currentDate.value.toISOString().slice(0,7)}.csv`; link.click()
  }

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(filteredTransactions.value, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `export_${account.value.name}_${currentDate.value.toISOString().slice(0,7)}.json`; link.click()
  }

  return {
    showTransactionModal, transactionToEdit, transactionToDuplicate, showDeleteModal, transactionToDelete, loading,
    handleEdit, handleDuplicate, confirmDelete, handleDelete, togglePointed, handleBulkPoint, handleBulkDelete, handleExport, handleExportJSON
  }
}