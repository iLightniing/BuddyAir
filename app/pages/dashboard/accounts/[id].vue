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

const methodIcons: Record<string, string> = {
  card: 'lucide:credit-card',
  transfer: 'lucide:arrow-right-left',
  direct_debit: 'lucide:landmark',
  cash: 'lucide:banknote',
  check: 'lucide:scroll-text',
  other: 'lucide:more-horizontal'
}

const methodLabels: Record<string, string> = {
  card: 'Carte',
  transfer: 'Virement',
  direct_debit: 'Prélèvement',
  cash: 'Espèces',
  check: 'Chèque',
  other: 'Autre'
}

// Gestion de la date (Mois en cours)
const currentDate = ref(new Date())

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

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

const allSelected = computed(() => {
  return transactions.value.length > 0 && selectedTransactions.value.length === transactions.value.length
})

const toggleAll = (checked?: boolean) => {
  if (checked) {
    selectedTransactions.value = transactions.value.map(tx => tx.id)
  } else {
    selectedTransactions.value = []
  }
}

const toggleSelection = (id: string, checked?: boolean) => {
  if (checked) selectedTransactions.value.push(id)
  else selectedTransactions.value = selectedTransactions.value.filter(tid => tid !== id)
}

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
    <div v-if="account" class="relative flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-ui-surface border border-ui-border p-3 rounded-md shadow-sm sticky top-14 z-30">
      
      <!-- Gauche : Navigation & Actions -->
      <div class="flex items-center gap-2 w-full xl:w-auto">
        <NuxtLink to="/dashboard/accounts" class="p-2 hover:bg-ui-surface-muted rounded-md text-ui-content-muted hover:text-ui-content transition-colors" title="Retour aux comptes">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>

        <div class="h-6 w-px bg-ui-border hidden sm:block mx-2"></div>

        <button 
          @click="transactionToEdit = null; showTransactionModal = true"
          class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
          title="Ajouter une opération"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span class="hidden sm:inline">Ajouter</span>
        </button>

        <button disabled class="flex items-center gap-2 px-3 py-2 bg-ui-surface-muted text-ui-content-muted/50 rounded-md border border-ui-border/50 cursor-not-allowed text-xs font-bold" title="Bientôt disponible">
          <Icon name="lucide:calendar-clock" class="w-4 h-4" />
          <span class="hidden sm:inline">Échéancier</span>
        </button>
      </div>

      <!-- Centre : Timeline (Absolue sur desktop pour centrage parfait) -->
      <div class="flex justify-center w-full xl:w-auto xl:absolute xl:left-1/2 xl:-translate-x-1/2 order-first xl:order-none mb-2 xl:mb-0">
        <div class="flex items-center gap-2 bg-ui-surface-muted/50 rounded-md p-1 border border-ui-border/50 shadow-sm">
          <button @click="prevMonth" class="p-1.5 hover:bg-white rounded-md text-ui-content-muted hover:text-ui-content transition-all shadow-sm hover:shadow">
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
          </button>
          <span class="text-xs font-black uppercase tracking-widest text-ui-content min-w-[100px] text-center tabular-nums">
            {{ currentMonthLabel }}
          </span>
          <button @click="nextMonth" class="p-1.5 hover:bg-white rounded-md text-ui-content-muted hover:text-ui-content transition-all shadow-sm hover:shadow">
            <Icon name="lucide:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Droite : Infos Compte & Soldes -->
      <div class="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
        
        <!-- Info Compte (Discret) -->
        <div class="flex flex-col items-end mr-auto sm:mr-0">
           <h1 class="text-sm font-black text-ui-content">{{ account.name }}</h1>
           <span class="text-[10px] font-medium text-ui-content-muted uppercase tracking-wider">{{ account.bank }} • {{ account.id.substring(0, 4) }}</span>
        </div>

        <div class="h-6 w-px bg-ui-border hidden sm:block"></div>

        <!-- Soldes Compacts -->
        <div class="flex items-center gap-6">
           <div class="text-right hidden sm:block opacity-70">
              <p class="text-[9px] font-bold text-ui-content-muted uppercase tracking-wider">Pointé</p>
              <p class="text-sm font-black text-ui-content tabular-nums">
                <UiCountUp :value="balances.cleared" :currency="account.currency" />
              </p>
           </div>
           
           <div class="text-right">
              <p class="text-[9px] font-bold text-ui-content-muted uppercase tracking-wider">Actuel</p>
              <p class="text-sm font-black tabular-nums" :class="balances.current >= 0 ? 'text-emerald-600' : 'text-red-600'">
                <UiCountUp :value="balances.current" :currency="account.currency" />
              </p>
           </div>

           <div class="text-right hidden 2xl:block opacity-70">
              <p class="text-[9px] font-bold text-ui-content-muted uppercase tracking-wider">Prévu</p>
              <p class="text-sm font-black text-ui-content tabular-nums">
                <UiCountUp :value="balances.projected" :currency="account.currency" />
              </p>
           </div>
        </div>
      </div>
    </div>

    <!-- Liste des transactions -->
    <div class="bg-ui-surface border border-ui-border rounded-md shadow-sm overflow-hidden">
      <div v-if="loading" class="p-20 flex justify-center">
        <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
      </div>
      
      <div v-else-if="transactions.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-ui-border bg-ui-surface-muted/50">
              <th class="p-3 pl-6 w-12 text-center">
                <UiCheckbox :model-value="allSelected" @update:model-value="toggleAll" />
              </th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest w-28">Date</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest">Description</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest w-24">Type</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">Débit</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">Crédit</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-center w-16">Pointé</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">Solde</th>
              <th class="p-3 pr-6 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-20">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ui-border">
            <tr v-for="tx in transactionsWithBalance" :key="tx.id" class="group hover:bg-white hover:shadow-lg hover:z-10 relative transition-all duration-200">
              <td class="p-3 pl-6 align-top text-center">
                <UiCheckbox :model-value="selectedTransactions.includes(tx.id)" @update:model-value="(val) => toggleSelection(tx.id, val)" />
              </td>
              <!-- Date -->
              <td class="p-3 text-sm font-bold text-ui-content-muted tabular-nums align-top whitespace-nowrap">
                <div class="flex flex-col">
                  <span>{{ new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }}</span>
                  <span v-if="tx.pointed_at" class="text-[10px] text-emerald-600 font-medium mt-0.5">
                    Validé le {{ new Date(tx.pointed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }}
                  </span>
                </div>
              </td>
              
              <!-- Description & Catégorie -->
              <td class="p-3 align-top">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-bold text-ui-content">{{ tx.description || 'Sans description' }}</span>
                  <div class="flex items-center gap-2">
                    <span class="inline-flex self-start items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-ui-surface-muted border border-ui-border text-ui-content-muted">
                      {{ tx.category }}
                    </span>
                    <span v-if="tx.sub_category" class="flex items-center gap-1 text-[10px] text-ui-content-muted font-medium">
                      <Icon name="lucide:chevron-right" class="w-3 h-3 opacity-50" />
                      {{ tx.sub_category }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="p-3 align-top">
                <div class="flex items-center gap-2" :title="tx.payment_method">
                  <div class="w-6 h-6 rounded-md flex items-center justify-center bg-ui-surface-muted text-ui-content-muted">
                    <Icon :name="methodIcons[tx.payment_method] || 'lucide:more-horizontal'" class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-xs font-medium text-ui-content-muted hidden xl:inline-block capitalize">
                    {{ methodLabels[tx.payment_method] || tx.payment_method }}
                  </span>
                </div>
              </td>

              <!-- Débit -->
              <td class="p-3 text-right font-black tabular-nums text-sm text-red-600 align-top whitespace-nowrap">
                <span v-if="tx.type === 'expense'">-{{ tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
              </td>

              <!-- Crédit -->
              <td class="p-3 text-right font-black tabular-nums text-sm text-emerald-600 align-top whitespace-nowrap">
                <span v-if="tx.type === 'income'">+{{ tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
              </td>

              <!-- Pointé -->
              <td class="p-3 text-center align-top">
                <div class="flex justify-center">
                  <UiCheckbox :model-value="tx.status === 'completed'" @update:model-value="(val) => togglePointed(tx, val)" />
                </div>
              </td>

              <!-- Solde -->
              <td class="p-3 text-right font-bold tabular-nums text-sm align-top whitespace-nowrap" :class="tx.running_balance >= 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ tx.running_balance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}
              </td>

              <!-- Action -->
              <td class="p-3 pr-6 text-right align-top">
                <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="transactionToEdit = tx; showTransactionModal = true" class="w-8 h-8 flex items-center justify-center hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                    <Icon name="lucide:pencil" class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(tx)" class="w-8 h-8 flex items-center justify-center hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-20 h-20 bg-ui-surface-muted rounded-3xl flex items-center justify-center mb-6 text-ui-content-muted/20">
          <Icon name="lucide:receipt" class="w-10 h-10" />
        </div>
        <h3 class="text-xl font-black text-ui-content mb-2">Aucune opération</h3>
        <p class="text-ui-content-muted text-sm max-w-xs mx-auto mb-8">Ce compte est bien calme... Ajoutez votre première dépense ou revenu.</p>
        <UiButton @click="transactionToEdit = null; showTransactionModal = true" variant="secondary">
          Ajouter une opération
        </UiButton>
      </div>
    </div>

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