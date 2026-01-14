export const useProjectDeposit = (accounts: Ref<any[]>, onSuccess: () => void) => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const user = usePocketBaseUser()

  const showDepositModal = ref(false)
  const depositProject = ref<any>(null)
  const depositAmount = ref('')
  const depositAccount = ref('')
  const transferType = ref<'deposit' | 'withdraw'>('deposit')

  const openTransferModal = (project: any) => {
    depositProject.value = project
    depositAmount.value = ''
    depositAccount.value = ''
    transferType.value = 'deposit'
    showDepositModal.value = true
  }

  const confirmDeposit = async () => {
    if (!depositProject.value) return
    if (!user.value) return

    if (!depositAccount.value) {
       notify('Veuillez sélectionner un compte source', 'error')
       return
    }
    const amount = parseFloat(depositAmount.value)
    if (isNaN(amount) || amount <= 0) {
       notify('Montant invalide', 'error')
       return
    }

    if (transferType.value === 'withdraw' && depositProject.value.saved_amount < amount) {
       notify('Solde insuffisant dans le projet', 'error')
       return
    }

    try {
      const isDeposit = transferType.value === 'deposit'
      
      // 1. Créer la transaction sur le compte bancaire
      await pb.collection('transactions').create({
        user: user.value.id,
        account: depositAccount.value,
        type: isDeposit ? 'expense' : 'income',
        amount: amount,
        category: 'Épargne',
        description: `${isDeposit ? 'Versement' : 'Retrait'} projet : ${depositProject.value.name}`,
        date: new Date().toISOString(),
        payment_method: 'transfer',
        status: 'completed',
        pointed_at: new Date().toISOString()
      })

      // 2. Mettre à jour le solde du compte bancaire
      const sourceAccount = accounts.value.find(a => a.id === depositAccount.value)
      if (sourceAccount) {
        const newBalance = isDeposit 
          ? sourceAccount.current_balance - amount 
          : sourceAccount.current_balance + amount
          
        await pb.collection('accounts').update(sourceAccount.id, { current_balance: newBalance })
      }

      // 3. Mettre à jour la cagnotte du projet
      const newAmount = isDeposit ? depositProject.value.saved_amount + amount : depositProject.value.saved_amount - amount
      await pb.collection('savings_goals').update(depositProject.value.id, { saved_amount: newAmount })
      
      notify('Épargne mise à jour avec succès', 'success')
      showDepositModal.value = false
      onSuccess()
    } catch (e) { notify('Erreur lors du versement', 'error') }
  }

  return { showDepositModal, depositProject, depositAmount, depositAccount, transferType, openTransferModal, confirmDeposit }
}