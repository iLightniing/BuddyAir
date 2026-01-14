export const useTransactionForm = (props: any, emit: any) => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const loading = ref(false)
  const isInitializing = ref(false)
  const availableAccounts = ref<any[]>([])
  const projects = ref<any[]>([])

  const form = ref({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Autre',
    sub_category: '',
    payment_method: 'card',
    transfer_account: '',
    description: '',
    pointed_at: '',
    is_recurring: false
  })

  // Charger les comptes pour le virement
  const fetchAccounts = async () => {
    try {
      const [accs, projs] = await Promise.all([
        pb.collection('accounts').getFullList({ sort: '+name' }),
        pb.collection('savings_goals').getFullList({ sort: '+name' })
      ])
      
      projects.value = projs

      const accountOptions = accs
        .filter(acc => acc.id !== props.accountId)
        .map(acc => ({ label: acc.name, value: acc.id }))
      
      const projectOptions = projs.map(p => ({ label: `Projet : ${p.name}`, value: p.id }))

      const options: any[] = []
      if (accountOptions.length > 0) {
         options.push({ label: '── Comptes ──', value: 'grp_accounts', disabled: true })
         options.push(...accountOptions)
      }
      if (projectOptions.length > 0) {
         options.push({ label: '── Projets ──', value: 'grp_projects', disabled: true })
         options.push(...projectOptions)
      }
      availableAccounts.value = options
    } catch (e) {
      console.error("Erreur chargement comptes", e)
    }
  }

  const handleSubmit = async () => {
    loading.value = true
    const user = pb.authStore.model
    
    try {
      const amountValue = parseFloat(form.value.amount)
      if (isNaN(amountValue)) throw new Error("Montant invalide")

      const data = {
        user: user?.id,
        account: props.accountId,
        type: form.value.type,
        amount: Math.abs(amountValue), 
        date: new Date(form.value.date || new Date()).toISOString(),
        category: form.value.category,
        sub_category: form.value.sub_category,
        payment_method: form.value.payment_method,
        description: form.value.description,
        status: form.value.pointed_at ? 'completed' : 'pending',
        pointed_at: form.value.pointed_at ? new Date(form.value.pointed_at).toISOString() : null,
        is_recurring: form.value.is_recurring
      }

      let record
      if (props.transaction) {
        record = await pb.collection('transactions').update(props.transaction.id, data)
      } else {
        record = await pb.collection('transactions').create(data)
      }

      // Gestion du virement inter-comptes (Création uniquement)
      if (form.value.payment_method === 'transfer' && form.value.transfer_account && !props.transaction) { 
        // Vérifier si c'est un projet
        const targetProject = projects.value.find(p => p.id === form.value.transfer_account)

        if (targetProject) {
           // C'est un virement vers/depuis un PROJET
           const isDeposit = form.value.type === 'expense' // Dépense = Versement sur le projet
           const newSavedAmount = isDeposit 
             ? targetProject.saved_amount + Math.abs(amountValue)
             : targetProject.saved_amount - Math.abs(amountValue)
           
           await pb.collection('savings_goals').update(targetProject.id, { saved_amount: newSavedAmount })
        } else {
           // C'est un virement vers un autre COMPTE (Logique existante)
           const linkedData = {
            ...data,
            account: form.value.transfer_account,
            type: form.value.type === 'expense' ? 'income' : 'expense',
            related_transaction: record.id,
          }
          
          const linkedRecord = await pb.collection('transactions').create(linkedData)
          await pb.collection('transactions').update(record.id, { related_transaction: linkedRecord.id })

          const targetAccount = await pb.collection('accounts').getOne(form.value.transfer_account)
          const targetAmount = linkedData.type === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue)
          await pb.collection('accounts').update(form.value.transfer_account, { 
            current_balance: targetAccount.current_balance + targetAmount 
          })
        }
      }

      // Mise à jour du solde du compte
      const account = await pb.collection('accounts').getOne(props.accountId)
      let newBalance = account.current_balance

      if (props.transaction) {
        const oldAmount = props.transaction.type === 'expense' ? -Math.abs(props.transaction.amount) : Math.abs(props.transaction.amount)
        newBalance -= oldAmount
      }

      const newAmount = form.value.type === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue)
      await pb.collection('accounts').update(props.accountId, { current_balance: newBalance + newAmount })
      
      notify(props.transaction ? 'Opération modifiée' : 'Opération ajoutée', 'success')
      emit('success')
      emit('close')
    } catch (e: any) {
      console.error("❌ ERREUR TRANSACTION (Détails) :", e.data)
      notify(e.message || "Erreur lors de l'enregistrement", "error")
    } finally {
      loading.value = false
    }
  }

  // Initialisation
  watch(() => props.show, (isOpen) => {
    if (isOpen) {
      fetchAccounts()
      isInitializing.value = true
      
      const source = props.transaction || props.initialData
      if (source) {
        form.value = {
          type: source.type,
          amount: Math.abs(source.amount).toString(),
          date: props.transaction ? source.date.split('T')[0] : new Date().toISOString().split('T')[0],
          category: source.category,
          sub_category: source.sub_category || '',
          payment_method: source.payment_method || 'card',
          transfer_account: '',
          description: source.description,
          pointed_at: props.transaction ? (source.pointed_at ? source.pointed_at.split('T')[0] : '') : '',
          is_recurring: props.transaction ? (source.is_recurring || false) : false
        }
      } else {
        // Reset form defaults
        form.value.amount = ''
        form.value.description = ''
        // ... autres resets si nécessaire
      }
      setTimeout(() => { isInitializing.value = false }, 100)
    }
  })

  return { form, loading, handleSubmit, availableAccounts, isInitializing }
}