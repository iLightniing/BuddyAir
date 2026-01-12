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
const selectedTransactions = ref<string[]>([])
const loading = ref(true)
const showTransactionModal = ref(false)
const transactionToEdit = ref<any>(null)
const showDeleteModal = ref(false)
const transactionToDelete = ref<any>(null)

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

// Calcul des soldes
const balances = computed(() => {
  if (!account.value) return { current: 0, cleared: 0, projected: 0 }
  
  const current = account.value.current_balance
  
  // Solde pointé = Solde actuel - (Impact des opérations en attente)
  // Si une dépense est en attente, elle a déjà réduit le solde actuel, donc on la rajoute pour trouver le solde pointé (bancaire)
  // Si un revenu est en attente, il a déjà augmenté le solde actuel, donc on le retire.
  let pendingImpact = 0
  pendingTransactions.value.forEach(tx => {
    if (tx.type === 'expense') pendingImpact -= tx.amount
    else pendingImpact += tx.amount
  })
  
  const cleared = current - pendingImpact
  const projected = current // Pour l'instant, identique au solde actuel (sauf si on ajoute des ops futures)

  return { current, cleared, projected }
})

// Chargement des données
const fetchData = async () => {
  loading.value = true
  selectedTransactions.value = []
  try {
    // 1. Récupérer le compte
    account.value = await pb.collection('accounts').getOne(accountId)

    // Filtres de date pour le mois sélectionné
    const start = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).toISOString()
    const end = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0, 23, 59, 59).toISOString()
    
    // 2. Récupérer les transactions du mois
    const result = await pb.collection('transactions').getList(1, 500, {
      filter: `account = "${accountId}" && date >= "${start}" && date <= "${end}"`,
      sort: '-date,-created',
    })
    transactions.value = result.items

    // 3. Récupérer les transactions en attente (toutes dates confondues pour le calcul du solde pointé)
    pendingTransactions.value = await pb.collection('transactions').getFullList({
      filter: `account = "${accountId}" && status = "pending"`,
    })

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
  showDeleteModal.value = true
}

const handleEdit = (tx: any) => {
  transactionToEdit.value = tx
  showTransactionModal.value = true
}

const handleDelete = async () => {
  if (!transactionToDelete.value) return
  try {
    const tx = transactionToDelete.value
    
    await pb.collection('transactions').delete(tx.id)

    // Mise à jour du solde (Inverse de l'opération)
    if (tx && account.value) {
      const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
      const newBalance = account.value.current_balance - amount
      await pb.collection('accounts').update(accountId, { current_balance: newBalance })
    }

    notify("Opération supprimée", "success")
    showDeleteModal.value = false
    fetchData() // Recharger pour mettre à jour la liste (et idéalement le solde)
  } catch (e) {
    notify("Erreur lors de la suppression", "error")
  }
}

const togglePointed = async (tx: any, checked?: boolean) => {
  try {
    const status = checked ? 'completed' : 'pending'
    const pointed_at = checked ? new Date().toISOString() : null
    
    await pb.collection('transactions').update(tx.id, { status, pointed_at })
    
    // Mise à jour locale
    tx.status = status
    tx.pointed_at = pointed_at
    
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
      @add="handleEdit(null)"
    />

    <!-- Liste des transactions -->
    <DashboardTransactionTable 
      v-if="account"
      :transactions="transactionsWithBalance"
      :loading="loading"
      v-model:selected-transactions="selectedTransactions"
      :currency="account.currency"
      @edit="handleEdit"
      @delete="confirmDelete"
      @toggle-pointed="togglePointed"
    />

    <!-- Modale Transaction -->
    <DashboardTransactionModal 
      :show="showTransactionModal" 
      :transaction="transactionToEdit" 
      :account-id="accountId"
      @close="showTransactionModal = false" 
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