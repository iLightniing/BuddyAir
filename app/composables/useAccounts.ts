import { VueDraggable } from 'vue-draggable-plus'

interface Account {
  id: string
  name: string
  bank: string
  account_group: 'current' | 'savings' | 'credit'
  current_balance: number
  currency: string
  projected_balance?: number
  order: number
  [key: string]: any // Pour les propriétés spécifiques (taux, etc.)
}

export const useAccounts = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()

  const loading = ref(true)
  const isEditMode = ref(false)
  const isDragging = ref(false)

  // Data lists
  const allAccounts = ref<Account[]>([])
  const currentAccounts = ref<Account[]>([])
  const savingsAccounts = ref<Account[]>([])
  const creditAccounts = ref<Account[]>([])
  const otherAccounts = ref<Account[]>([])

  // Modal states
  const showModal = ref(false)
  const accountToEdit = ref<Account | null>(null)
  const showDeleteModal = ref(false)
  const accountToDelete = ref<Account | null>(null)
  const modalGroup = ref('current')

  const fetchAccounts = async () => {
    loading.value = true
    try {
      // On filtre explicitement par utilisateur pour être sûr
      const userId = pb.authStore.model?.id
      const data = await pb.collection('accounts').getFullList({ 
        filter: userId ? `user = "${userId}"` : '',
        sort: '+order',
        requestKey: null
      })
      
      // --- Calcul du solde à date (Today) ---
      // On récupère les transactions futures pour les soustraire du solde total
      const now = new Date().toISOString()
      const futureTransactions = await pb.collection('transactions').getFullList({
        filter: userId ? `user = "${userId}" && date > "${now}"` : `date > "${now}"`,
        fields: 'account,amount,type',
        requestKey: null
      })

      const adjustments: Record<string, number> = {}
      futureTransactions.forEach(tx => {
        const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
        adjustments[tx.account] = (adjustments[tx.account] || 0) + amount
      })

      const records = data?.map((record: any): Account => {
        const futureImpact = adjustments[record.id] || 0
        // On stocke le solde "DB" (qui inclut le futur) dans projected_balance pour l'info "Fin de mois"
        // Et on recalcule le current_balance pour qu'il reflète la réalité d'aujourd'hui
        return { 
          ...record, 
          projected_balance: record.current_balance,
          current_balance: record.current_balance - futureImpact 
        }
      }) || []
      
      allAccounts.value = records
      
      currentAccounts.value = records.filter(a => a.account_group === 'current')
      savingsAccounts.value = records.filter(a => a.account_group === 'savings')
      creditAccounts.value = records.filter(a => a.account_group === 'credit')
      otherAccounts.value = records.filter(a => !['current', 'savings', 'credit'].includes(a.account_group))

    } catch (e) {
      console.error("Erreur chargement comptes:", e)
      notify('Erreur lors du chargement des comptes', 'error')
    } finally {
      loading.value = false
    }
  }

  const handleCreate = (group: string) => {
    accountToEdit.value = null
    modalGroup.value = group
    showModal.value = true
  }

  const handleEdit = (acc: Account) => {
    accountToEdit.value = acc
    showModal.value = true
  }

  const handleDelete = (acc: Account) => {
    accountToDelete.value = acc
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!accountToDelete.value) return
    try {
      await pb.collection('accounts').delete(accountToDelete.value.id)
      fetchAccounts()
      showDeleteModal.value = false
      accountToDelete.value = null
      notify('Compte supprimé', 'success')
    } catch (error) {
      notify('Erreur lors de la suppression', 'error')
    }
  }

  const updateOrder = async () => {
    const all = [...currentAccounts.value, ...savingsAccounts.value, ...creditAccounts.value, ...otherAccounts.value]
    const promises = all.map((acc, index) => {
      if (acc.order !== index) {
        return pb.collection('accounts').update(acc.id, { order: index })
      }
    }).filter(Boolean)
    if (promises.length === 0) return
    try {
      await Promise.all(promises)
    } catch (e) {
      console.error("Erreur sauvegarde ordre:", e)
    }
  }

  onMounted(fetchAccounts)

  return {
    loading, isEditMode, isDragging,
    allAccounts, currentAccounts, savingsAccounts, creditAccounts, otherAccounts,
    showModal, accountToEdit, modalGroup,
    showDeleteModal, accountToDelete,
    fetchAccounts, handleCreate, handleEdit, handleDelete, confirmDelete, updateOrder
  }
}