<script setup lang="ts">
definePageMeta({
  title: 'Détails du compte'
})

const route = useRoute()
const pb = usePocketBase()
const { notify } = useNotification()

const accountId = route.params.id as string
const account = ref<any>(null)
const transactions = ref<any[]>([])
const pendingTransactions = ref<any[]>([])
const futureTransactions = ref<any[]>([])
const selectedTransactions = ref<string[]>([])
const loading = ref(true)
const showTransactionModal = ref(false)
const transactionToEdit = ref<any>(null)
const transactionToDuplicate = ref<any>(null)
const showDeleteModal = ref(false)
const transactionToDelete = ref<any>(null)

// Filtres & Recherche
const searchQuery = ref('')
const filterType = ref('all')
const filterStatus = ref('all')

// Gestion de la date (Mois en cours)
const currentDate = ref(new Date())

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  fetchData()
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  fetchData()
}

// Calcul du solde progressif (en partant du solde actuel et en remontant le temps)
const transactionsWithBalance = computed(() => {
  if (!account.value) return []
  
  // Note: Pour être parfaitement exact avec la pagination/filtre par mois, 
  // il faudrait connaître le solde à la fin du mois sélectionné.
  // Ici on utilise le solde actuel du compte, ce qui est correct si on est sur le mois en cours.
  let balance = account.value.current_balance // TODO: Ajuster si on navigue dans le passé
  
  return transactions.value.map(tx => {
    const snapshotBalance = balance
    // On prépare le solde pour la ligne suivante (transaction précédente dans le temps)
    // Si c'était un revenu, le solde avant était plus bas. Si dépense, plus haut.
    balance = tx.type === 'income' ? balance - tx.amount : balance + tx.amount
    return { ...tx, running_balance: snapshotBalance }
  })
})

// Transactions filtrées pour l'affichage
const filteredTransactions = computed(() => {
  return transactionsWithBalance.value.filter(tx => {
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      (tx.description || '').toLowerCase().includes(searchLower) ||
      (tx.category || '').toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchLower)

    const matchesType = filterType.value === 'all' || tx.type === filterType.value
    const matchesStatus = filterStatus.value === 'all' || (filterStatus.value === 'completed' ? tx.status === 'completed' : tx.status !== 'completed')

    return matchesSearch && matchesType && matchesStatus
  })
})

// Calcul des soldes
const balances = computed(() => {
  if (!account.value) return { current: 0, cleared: 0, projected: 0 }
  
  const totalBalance = account.value.current_balance
  
  // 1. Solde pointé (Cleared) = Total - Transactions en attente
  let pendingImpact = 0
  pendingTransactions.value.forEach(tx => {
    if (tx.type === 'expense') pendingImpact -= tx.amount
    else pendingImpact += tx.amount
  })
  const cleared = totalBalance - pendingImpact
  
  // 2. Solde actuel (Aujourd'hui) = Total - Transactions futures (> maintenant)
  let futureImpact = 0
  futureTransactions.value.forEach(tx => {
    if (tx.type === 'expense') futureImpact -= tx.amount
    else futureImpact += tx.amount
  })
  const current = totalBalance - futureImpact

  // 3. Solde prévu (Fin du mois) = Total - Transactions après la fin du mois courant
  // On se base sur le mois réel actuel pour la projection "fin de mois"
  const now = new Date()
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  
  let afterMonthImpact = 0
  futureTransactions.value.forEach(tx => {
    if (new Date(tx.date) > endOfCurrentMonth) {
       if (tx.type === 'expense') afterMonthImpact -= tx.amount
       else afterMonthImpact += tx.amount
    }
  })
  const projected = totalBalance - afterMonthImpact

  return { current, cleared, projected }
})

// Chargement des données
const fetchData = async () => {
  loading.value = true
  selectedTransactions.value = []
  try {
    // 1. Récupérer le compte
    const acc = await pb.collection('accounts').getOne(accountId, { requestKey: null })
    account.value = { ...acc }
    if (account.value) route.meta.title = `Détails du compte<span class="hidden md:inline"> : ${account.value.name}</span>`

    // Filtres de date pour le mois sélectionné
    const start = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).toISOString()
    const end = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0, 23, 59, 59).toISOString()
    
    // 2. Récupérer les transactions du mois
    const result = await pb.collection('transactions').getList(1, 500, {
      filter: `account = "${accountId}" && date >= "${start}" && date <= "${end}"`,
      sort: '-date,-created',
      requestKey: null
    })
    transactions.value = result.items.map(i => ({ ...i }))

    // 3. Récupérer les transactions en attente (toutes dates confondues pour le calcul du solde pointé)
    const pending = await pb.collection('transactions').getFullList({
      filter: `account = "${accountId}" && status = "pending"`,
      requestKey: null
    })
    pendingTransactions.value = pending.map(i => ({ ...i }))

    // 4. Récupérer les transactions futures (> maintenant) pour le calcul du solde actuel
    const nowISO = new Date().toISOString()
    const future = await pb.collection('transactions').getFullList({
      filter: `account = "${accountId}" && date > "${nowISO}"`,
      requestKey: null
    })
    futureTransactions.value = future.map(i => ({ ...i }))

  } catch (e: any) {
    console.error("Erreur détaillée PocketBase :", e)
    notify("Erreur lors du chargement des données", "error")
    navigateTo('/dashboard/accounts')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const confirmDelete = (tx: any) => {
  transactionToDelete.value = tx
  showTransactionModal.value = false
  showDeleteModal.value = true
}

const handleEdit = (tx: any) => {
  transactionToEdit.value = tx
  transactionToDuplicate.value = null
  showTransactionModal.value = true
}

const handleDuplicate = (tx: any) => {
  transactionToDuplicate.value = { ...tx }
  transactionToEdit.value = null // On s'assure qu'on n'est pas en mode édition
  showTransactionModal.value = true
}

const processDeleteTransaction = async (tx: any) => {
  try {
    
    // Gestion de la transaction liée (Virement)
    if (tx.related_transaction) {
      try {
        const relatedTx = await pb.collection('transactions').getOne(tx.related_transaction)
        
        // Suppression de la transaction liée
        await pb.collection('transactions').delete(relatedTx.id)

        // Mise à jour du solde du compte lié
        const relatedAccount = await pb.collection('accounts').getOne(relatedTx.account)
        const relatedAmount = relatedTx.type === 'expense' ? -Math.abs(relatedTx.amount) : Math.abs(relatedTx.amount)
        
        await pb.collection('accounts').update(relatedTx.account, { 
          current_balance: relatedAccount.current_balance - relatedAmount 
        })
      } catch (err) {
        console.warn("Transaction liée introuvable ou erreur lors de sa suppression", err)
      }
    }

    await pb.collection('transactions').delete(tx.id)

    // Mise à jour du solde (Inverse de l'opération)
    if (tx && account.value) {
      const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
      const newBalance = account.value.current_balance - amount
      // Mise à jour locale pour les boucles
      account.value.current_balance = newBalance
      await pb.collection('accounts').update(accountId, { current_balance: newBalance })
    }
  } catch (err) {
    console.error("Erreur suppression transaction", err)
    throw err
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
    
    // Mise à jour locale sur la source pour la réactivité
    const sourceTx = transactions.value.find(t => t.id === tx.id)
    if (sourceTx) {
      sourceTx.status = status
      sourceTx.pointed_at = pointed_at
    }
    
    // Si c'est un virement lié, on met à jour l'autre transaction aussi
    if (tx.related_transaction) {
      try {
        await pb.collection('transactions').update(tx.related_transaction, { status, pointed_at })
      } catch (err) {
        // Silencieux si le champ n'existe pas encore ou erreur
        console.warn("Impossible de mettre à jour la transaction liée", err)
      }
    }

    // Mettre à jour la liste des pending pour le calcul du solde en temps réel
    if (checked) pendingTransactions.value = pendingTransactions.value.filter(t => t.id !== tx.id)
    else pendingTransactions.value.push(tx)

    notify(checked ? "Opération pointée" : "Opération dépointée", "success")
  } catch (e) {
    notify("Erreur lors du pointage", "error")
  }
}

// --- Actions Groupées ---

const handleBulkPoint = async (checked: boolean) => {
  const status = checked ? 'completed' : 'pending'
  const pointed_at = checked ? new Date().toISOString() : null
  
  loading.value = true
  try {
    await Promise.all(selectedTransactions.value.map(id => 
      pb.collection('transactions').update(id, { status, pointed_at })
    ))
    notify(`${selectedTransactions.value.length} opérations mises à jour`, 'success')
    selectedTransactions.value = []
    fetchData()
  } catch (e) {
    notify('Erreur lors de la mise à jour groupée', 'error')
  } finally {
    loading.value = false
  }
}

const handleBulkDelete = async () => {
  if (!confirm(`Supprimer définitivement ${selectedTransactions.value.length} opérations ?`)) return
  
  loading.value = true
  try {
    // On récupère les objets complets pour la logique de solde
    const txsToDelete = transactions.value.filter(t => selectedTransactions.value.includes(t.id))
    
    for (const tx of txsToDelete) {
       await processDeleteTransaction(tx)
    }
    
    notify('Opérations supprimées', 'success')
    selectedTransactions.value = []
    fetchData()
  } catch (e) {
    notify('Erreur lors de la suppression groupée', 'error')
  } finally {
    loading.value = false
  }
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
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `export_${account.value.name}_${currentDate.value.toISOString().slice(0,7)}.csv`
  link.click()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Barre d'outils unifiée (Retour, Timeline, Soldes, Actions) -->
    <DashboardAccountHeader 
      v-if="account"
      :account="account"
      :current-date="currentDate"
      :balances="balances"
      @prev-month="prevMonth"
      @next-month="nextMonth"
    />

    <!-- Barre de Commande Contextuelle (Sticky) -->
    <div v-if="account" class="bg-ui-surface border border-ui-border rounded-xl p-2 shadow-sm sticky top-14 z-30 transition-all duration-300">
       
       <!-- Mode Normal : Recherche & Actions -->
       <div v-if="selectedTransactions.length === 0" class="flex flex-col lg:flex-row gap-2 justify-between items-center">
          <!-- Recherche -->
          <div class="relative w-full lg:w-72">
             <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted" />
             <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher..." 
                class="w-full pl-9 pr-4 py-2 bg-ui-surface-muted border border-transparent focus:border-blue-500 focus:bg-white rounded-lg text-sm focus:outline-none transition-all"
             />
          </div>

          <!-- Filtres & Boutons -->
          <div class="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
             <select v-model="filterType" class="px-3 py-2 bg-ui-surface-muted hover:bg-ui-surface-muted/80 border border-transparent rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
                <option value="all">Tous types</option>
                <option value="income">Revenus</option>
                <option value="expense">Dépenses</option>
             </select>
             
             <select v-model="filterStatus" class="px-3 py-2 bg-ui-surface-muted hover:bg-ui-surface-muted/80 border border-transparent rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
                <option value="all">Tous statuts</option>
                <option value="completed">Pointés</option>
                <option value="pending">En attente</option>
             </select>

             <div class="w-px h-5 bg-ui-border mx-1 hidden sm:block"></div>

             <NuxtLink :to="`/dashboard/schedule?account=${account.id}`" class="p-2 text-ui-content-muted hover:text-ui-content hover:bg-ui-surface-muted rounded-lg transition-colors" title="Échéancier">
                <Icon name="lucide:calendar-clock" class="w-4 h-4" />
             </NuxtLink>
             
             <button @click="handleExport" class="p-2 text-ui-content-muted hover:text-ui-content hover:bg-ui-surface-muted rounded-lg transition-colors" title="Exporter">
                <Icon name="lucide:download" class="w-4 h-4" />
             </button>

             <button @click="handleEdit(null)" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-transform hover:scale-105 active:scale-95 ml-1">
                <Icon name="lucide:plus" class="w-4 h-4" />
                <span class="text-xs font-bold hidden sm:inline">Opération</span>
             </button>
          </div>
       </div>

       <!-- Mode Bulk : Actions Groupées (Remplace la recherche) -->
       <div v-else class="flex items-center justify-between gap-3 px-2 py-0.5 animate-in fade-in slide-in-from-top-1">
          <div class="flex items-center gap-3">
             <button @click="selectedTransactions = []" class="p-1.5 hover:bg-ui-surface-muted rounded-md text-ui-content-muted hover:text-ui-content transition-colors" title="Annuler la sélection">
                <Icon name="lucide:x" class="w-4 h-4" />
             </button>
             <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{{ selectedTransactions.length }} sélectionné(s)</span>
          </div>
          
          <div class="flex gap-2">
             <button @click="handleBulkPoint(true)" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-ui-border hover:border-blue-300 text-ui-content rounded-lg text-xs font-bold transition-colors shadow-sm">
                <Icon name="lucide:check" class="w-3.5 h-3.5 text-emerald-500" /> <span class="hidden sm:inline">Pointer</span>
             </button>
             <button @click="handleBulkPoint(false)" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-ui-border hover:border-orange-300 text-ui-content rounded-lg text-xs font-bold transition-colors shadow-sm">
                <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5 text-orange-500" /> <span class="hidden sm:inline">Dépointer</span>
             </button>
             <button @click="handleBulkDelete" class="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors">
                <Icon name="lucide:trash-2" class="w-3.5 h-3.5" /> <span class="hidden sm:inline">Supprimer</span>
             </button>
          </div>
       </div>
    </div>

    <!-- Liste des transactions -->
    <DashboardTransactionTable 
      v-if="account"
      :transactions="filteredTransactions"
      :loading="loading"
      v-model:selected-transactions="selectedTransactions"
      :currency="account.currency"
      @edit="handleEdit"
      @delete="confirmDelete"
      @duplicate="handleDuplicate"
      @toggle-pointed="togglePointed"
    />

    <!-- Modale Transaction -->
    <DashboardTransactionModal 
      :show="showTransactionModal" 
      :transaction="transactionToEdit" 
      :initial-data="transactionToDuplicate"
      :account-id="accountId"
      @close="showTransactionModal = false" 
      @delete="confirmDelete"
      @success="fetchData" 
    />

    <!-- Modal de suppression -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer l'opération ?</h3>
        </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer cette transaction de <span class="font-bold text-ui-content">{{ transactionToDelete?.amount }} €</span> ?
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="handleDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>