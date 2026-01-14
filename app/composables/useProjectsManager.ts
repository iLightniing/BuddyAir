export const useProjectsManager = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const user = usePocketBaseUser()

  const loading = ref(true)
  const projects = ref<any[]>([])
  const accounts = ref<any[]>([])

  // Modals state
  const showModal = ref(false)
  const editingProject = ref<any>(null)
  const showDeleteModal = ref(false)
  const projectToDelete = ref<any>(null)
  const showArchiveModal = ref(false)
  const projectToArchive = ref<any>(null)
  const showDepositModal = ref(false)
  const depositProject = ref<any>(null)
  const depositAmount = ref('')
  const depositAccount = ref('')
  const transferType = ref<'deposit' | 'withdraw'>('deposit')
  const showHistoryModal = ref(false)
  const historyProject = ref<any>(null)
  const historyTransactions = ref<any[]>([])
  const historyLoading = ref(false)

  const form = ref({
    name: '',
    target_amount: '',
    saved_amount: '0',
    deadline: '',
    icon: 'lucide:piggy-bank',
    color: 'bg-blue-500'
  })

  const colors = [
    { label: 'Bleu', value: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Vert', value: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Violet', value: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Orange', value: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Rose', value: 'bg-pink-500', text: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Rouge', value: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
  ]

  const icons = [
    'lucide:piggy-bank', 'lucide:plane', 'lucide:car', 'lucide:home', 
    'lucide:smartphone', 'lucide:gift', 'lucide:graduation-cap', 'lucide:gamepad-2'
  ]

  const fetchData = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const [projectsResult, accountsResult] = await Promise.all([
        pb.collection('savings_goals').getFullList({
          filter: `user = "${user.value.id}" && is_archived = false`,
          sort: '+order,-created',
          requestKey: null
        }),
        pb.collection('accounts').getFullList({
          sort: '+name',
          requestKey: null
        })
      ])
      
      projects.value = projectsResult.map(p => ({ ...p }))
      accounts.value = accountsResult.map(a => ({ ...a }))
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const stats = computed(() => {
    const totalSaved = projects.value.reduce((acc, p) => acc + p.saved_amount, 0)
    const totalTarget = projects.value.reduce((acc, p) => acc + p.target_amount, 0)
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
    return { totalSaved, totalTarget, progress, remaining: totalTarget - totalSaved }
  })

  const getMonthlyEffort = (project: any) => {
    if (!project.deadline || project.saved_amount >= project.target_amount) return null
    
    const now = new Date()
    const end = new Date(project.deadline)
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
    
    if (months <= 0) return { amount: project.target_amount - project.saved_amount, label: 'tout de suite' }
    
    const amount = (project.target_amount - project.saved_amount) / months
    return { amount, label: '/ mois' }
  }

  const getDeadlineBadge = (dateStr: string) => {
    if (!dateStr) return null
    const target = new Date(dateStr)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { label: 'Terminé', class: 'bg-gray-100 text-gray-600 border-gray-200' }
    if (diffDays <= 30) return { label: `J-${diffDays}`, class: 'bg-red-50 text-red-600 border-red-100' }
    return { label: target.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), class: 'bg-blue-50 text-blue-600 border-blue-100' }
  }

  const accountOptions = computed(() => {
    const options: any[] = []
    const groups: Record<string, string> = {
      current: 'Comptes Courants',
      savings: 'Épargne',
      credit: 'Crédits'
    }

    Object.entries(groups).forEach(([key, title]) => {
      const groupAccounts = accounts.value.filter(a => a.account_group === key)
      if (groupAccounts.length > 0) {
        options.push({ label: `── ${title} ──`, value: `grp_${key}`, disabled: true })
        groupAccounts.forEach(a => options.push({ label: `${a.name} (${a.current_balance} €)`, value: a.id }))
      }
    })
    
    const otherAccounts = accounts.value.filter(a => !['current', 'savings', 'credit'].includes(a.account_group))
    if (otherAccounts.length > 0) {
      options.push({ label: '── Autres ──', value: 'grp_other', disabled: true })
      otherAccounts.forEach(a => options.push({ label: `${a.name} (${a.current_balance} €)`, value: a.id }))
    }
    return options
  })

  const updateOrder = async () => {
    const promises = projects.value.map((p, index) => {
       return pb.collection('savings_goals').update(p.id, { order: index })
    })
    try { await Promise.all(promises) } catch(e) {}
  }

  const openModal = (project: any = null) => {
    editingProject.value = project
    if (project) {
      form.value = {
        name: project.name,
        target_amount: project.target_amount.toString(),
        saved_amount: project.saved_amount.toString(),
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        icon: project.icon || 'lucide:piggy-bank',
        color: project.color || 'bg-blue-500'
      }
    } else {
      form.value = { name: '', target_amount: '', saved_amount: '0', deadline: '', icon: 'lucide:piggy-bank', color: 'bg-blue-500' }
    }
    showModal.value = true
  }

  const saveProject = async () => {
    if (!user.value) return
    try {
      const data = {
        user: user.value.id,
        name: form.value.name,
        target_amount: parseFloat(form.value.target_amount || '0'),
        saved_amount: parseFloat(form.value.saved_amount || '0'),
        deadline: form.value.deadline ? new Date(form.value.deadline).toISOString() : null,
        icon: form.value.icon,
        color: form.value.color,
        order: editingProject.value ? editingProject.value.order : projects.value.length
      }

      if (editingProject.value) {
        await pb.collection('savings_goals').update(editingProject.value.id, data)
        notify('Projet mis à jour', 'success')
      } else {
        await pb.collection('savings_goals').create(data)
        notify('Projet créé', 'success')
      }
      showModal.value = false
      fetchData()
    } catch (e: any) {
      console.error("Erreur lors de l'enregistrement du projet :", e)
      notify('Erreur lors de l\'enregistrement', 'error')
    }
  }

  const deleteProject = (project: any) => {
    projectToDelete.value = project
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!projectToDelete.value) return
    try {
      await pb.collection('savings_goals').delete(projectToDelete.value.id)
      notify('Projet supprimé', 'success')
      showDeleteModal.value = false
      fetchData()
    } catch (e) {
      notify('Erreur', 'error')
    }
  }

  const archiveProject = (project: any) => {
    projectToArchive.value = project
    showArchiveModal.value = true
  }

  const confirmArchive = async () => {
    if (!projectToArchive.value) return
    try {
      await pb.collection('savings_goals').update(projectToArchive.value.id, { is_archived: true })
      notify('Projet archivé', 'success')
      showArchiveModal.value = false
      fetchData()
    } catch (e) {
      notify('Erreur lors de l\'archivage', 'error')
    }
  }

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
          
        await pb.collection('accounts').update(sourceAccount.id, {
          current_balance: newBalance
        })
      }

      // 3. Mettre à jour la cagnotte du projet
      const newAmount = isDeposit
        ? depositProject.value.saved_amount + amount
        : depositProject.value.saved_amount - amount

      await pb.collection('savings_goals').update(depositProject.value.id, {
        saved_amount: newAmount
      })
      notify('Épargne ajoutée avec succès', 'success')
      showDepositModal.value = false
      fetchData()
    } catch (e) {
      notify('Erreur lors du versement', 'error')
    }
  }

  const openHistoryModal = async (project: any) => {
    if (!user.value) return

    historyProject.value = project
    showHistoryModal.value = true
    historyLoading.value = true
    historyTransactions.value = []
    
    try {
      const result = await pb.collection('transactions').getList(1, 50, {
        filter: `user = "${user.value.id}" && category = "Épargne" && description ~ "${project.name}"`,
        sort: '-date',
        requestKey: null
      })
      historyTransactions.value = result.items.map(t => ({ ...t }))
    } catch (e) {
      console.error(e)
    } finally {
      historyLoading.value = false
    }
  }

  return {
    loading, projects, accounts,
    showModal, editingProject, showDeleteModal, projectToDelete,
    showDepositModal, depositProject, depositAmount, depositAccount, transferType,
    showHistoryModal, historyProject, historyTransactions, historyLoading,
    form, colors, icons, stats, accountOptions,
    fetchData, updateOrder, openModal, saveProject, deleteProject, confirmDelete,
    openTransferModal, confirmDeposit, openHistoryModal, archiveProject, 
    showArchiveModal, projectToArchive, confirmArchive,
    getMonthlyEffort, getDeadlineBadge
  }
}