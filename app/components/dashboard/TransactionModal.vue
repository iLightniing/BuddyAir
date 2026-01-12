<script setup lang="ts">
const props = defineProps<{ 
  show: boolean, 
  transaction?: any,
  accountId: string
}>()
const emit = defineEmits(['close', 'success'])

const pb = usePocketBase()
const { notify } = useNotification()
const loading = ref(false)

const form = ref({
  type: 'expense', // 'expense' | 'income'
  amount: '',
  date: new Date().toISOString().split('T')[0],
  category: 'Autre',
  sub_category: '',
  payment_method: 'card',
  transfer_account: '',
  description: '',
  pointed_at: ''
})

const categoriesData: Record<string, string[]> = {
  'Alimentation': ['Courses', 'Restaurant', 'Fast Food', 'Boulangerie', 'Autre'],
  'Logement': ['Loyer', 'Électricité', 'Eau', 'Internet', 'Assurance', 'Travaux', 'Autre'],
  'Transport': ['Carburant', 'Transport en commun', 'Entretien', 'Assurance', 'Parking', 'Péage', 'Autre'],
  'Loisirs': ['Sorties', 'Sport', 'Voyage', 'Streaming', 'Jeux vidéo', 'Autre'],
  'Santé': ['Médecin', 'Pharmacie', 'Mutuelle', 'Spécialiste', 'Autre'],
  'Shopping': ['Vêtements', 'Électronique', 'Maison', 'Cadeaux', 'Autre'],
  'Salaire': ['Salaire', 'Prime', 'Remboursement', 'Autre'],
  'Services': ['Banque', 'Frais', 'Abonnement', 'Autre'],
  'Autre': ['Autre']
}

const categoryOptions = Object.keys(categoriesData).map(c => ({ label: c, value: c }))

const subCategoryOptions = computed(() => {
  const category = form.value.category
  const subCategories = categoriesData[category]
  return subCategories ? subCategories.map(s => ({ label: s, value: s })) : []
})

const paymentMethods = [
  { label: 'Carte Bancaire', value: 'card' },
  { label: 'Virement', value: 'transfer' },
  { label: 'Prélèvement', value: 'direct_debit' },
  { label: 'Espèces', value: 'cash' },
  { label: 'Chèque', value: 'check' },
  { label: 'Autre', value: 'other' }
]

const typeOptions = [
  { label: 'Dépense', value: 'expense', activeClass: 'bg-red-50 text-red-600 border-red-200 shadow-sm' },
  { label: 'Revenu', value: 'income', activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' }
]

const isInitializing = ref(false)
const availableAccounts = ref<any[]>([])

// Charger les comptes pour le virement
const fetchAccounts = async () => {
  try {
    const accounts = await pb.collection('accounts').getFullList({ sort: '+name' })
    // On exclut le compte actuel
    availableAccounts.value = accounts
      .filter(acc => acc.id !== props.accountId)
      .map(acc => ({ label: acc.name, value: acc.id }))
  } catch (e) {
    console.error("Erreur chargement comptes", e)
  }
}

// Initialisation du formulaire à l'ouverture
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    fetchAccounts()
    isInitializing.value = true
    if (props.transaction) {
      form.value = {
        type: props.transaction.type,
        amount: Math.abs(props.transaction.amount).toString(),
        date: props.transaction.date.split('T')[0],
        category: props.transaction.category,
        sub_category: props.transaction.sub_category || '',
        payment_method: props.transaction.payment_method || 'card',
        transfer_account: '', // En édition, on ne gère pas le changement de compte lié pour l'instant
        description: props.transaction.description,
        pointed_at: props.transaction.pointed_at ? props.transaction.pointed_at.split('T')[0] : ''
      }
    } else {
      form.value = {
        type: 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Autre',
        sub_category: '',
        payment_method: 'card',
        transfer_account: '',
        description: '',
        pointed_at: ''
      }
    }
    // On laisse le temps au formulaire de s'initialiser avant d'activer les watchers
    setTimeout(() => { isInitializing.value = false }, 100)
  }
})

// Réinitialiser la sous-catégorie si la catégorie change (sauf à l'initialisation)
watch(() => form.value.category, () => {
  if (!isInitializing.value) {
    form.value.sub_category = ''
  }
})

const handleSubmit = async () => {
  loading.value = true
  const user = pb.authStore.model
  
  try {
    const amountValue = parseFloat(form.value.amount)
    if (isNaN(amountValue)) throw new Error("Montant invalide")

    // On stocke le montant en absolu dans la base, le type détermine le signe pour l'affichage
    // (Ou vous pouvez stocker en négatif pour les dépenses si vous préférez pour les calculs SQL)
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
      pointed_at: form.value.pointed_at ? new Date(form.value.pointed_at).toISOString() : null
    }

    let record
    if (props.transaction) {
      record = await pb.collection('transactions').update(props.transaction.id, data)
    } else {
      record = await pb.collection('transactions').create(data)
    }

    // Gestion du virement inter-comptes (Création uniquement)
    if (form.value.payment_method === 'transfer' && form.value.transfer_account && !props.transaction) {
      const linkedData = {
        ...data,
        account: form.value.transfer_account,
        type: form.value.type === 'expense' ? 'income' : 'expense', // Inverse
        related_transaction: record.id,
        // On garde la même description, date, etc.
      }
      
      // Création de la transaction liée
      const linkedRecord = await pb.collection('transactions').create(linkedData)
      
      // Mise à jour de la transaction originale pour faire le lien
      await pb.collection('transactions').update(record.id, { related_transaction: linkedRecord.id })

      // Mise à jour du solde du compte cible
      const targetAccount = await pb.collection('accounts').getOne(form.value.transfer_account)
      const targetAmount = linkedData.type === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue)
      await pb.collection('accounts').update(form.value.transfer_account, { 
        current_balance: targetAccount.current_balance + targetAmount 
      })
    }

    // --- Mise à jour du solde du compte ---
    // 1. On récupère le compte à jour pour éviter les décalages
    const account = await pb.collection('accounts').getOne(props.accountId)
    let newBalance = account.current_balance

    // 2. Si c'est une modification, on annule l'effet de l'ancienne transaction
    if (props.transaction) {
      const oldAmount = props.transaction.type === 'expense' ? -Math.abs(props.transaction.amount) : Math.abs(props.transaction.amount)
      newBalance -= oldAmount
    }

    // 3. On applique la nouvelle transaction
    const newAmount = form.value.type === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue)
    await pb.collection('accounts').update(props.accountId, { current_balance: newBalance + newAmount })
    
    notify(props.transaction ? 'Opération modifiée' : 'Opération ajoutée', 'success')
    emit('success')
    emit('close')
  } catch (e: any) {
    notify(e.message || "Erreur lors de l'enregistrement", "error")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-2xl w-full">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-ui-content tracking-tight">
          {{ transaction ? 'Modifier l\'opération' : 'Nouvelle opération' }}
        </h3>
        <button @click="emit('close')" class="text-ui-content-muted hover:text-ui-content transition-colors">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Ligne 1 : Type & Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1">Type</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-ui-surface-muted rounded-lg border border-ui-border">
              <button 
                v-for="opt in typeOptions" 
                :key="opt.value"
                type="button"
                @click="form.type = opt.value"
                class="py-2 text-sm font-bold rounded-md transition-all border border-transparent"
                :class="form.type === opt.value ? opt.activeClass : 'text-ui-content-muted hover:text-ui-content'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UiDate v-model="form.date" label="Date" required />
            <UiDate v-model="form.pointed_at" label="Pointage" />
          </div>
        </div>

        <!-- Ligne 2 : Montant & Paiement -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1 mb-2 block">Montant</label>
            <div class="relative group">
              <input 
                v-model="form.amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                required
                class="w-full text-3xl font-black bg-transparent border-b-2 border-ui-border focus:border-blue-500 outline-none py-1 px-1 tabular-nums transition-colors placeholder:text-ui-content-muted/20"
                :class="form.type === 'expense' ? 'text-red-600' : 'text-emerald-600'"
              />
              <span class="absolute right-0 top-1/2 -translate-y-1/2 text-ui-content-muted font-bold pointer-events-none">EUR</span>
            </div>
          </div>
          <UiSelect v-model="form.payment_method" label="Moyen de paiement" :options="paymentMethods" />
        </div>

        <!-- Ligne 3 : Catégorisation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UiSelect v-model="form.category" label="Catégorie" :options="categoryOptions" />
          <UiSelect v-model="form.sub_category" label="Sous-catégorie" :options="subCategoryOptions" placeholder="Sélectionner..." />
        </div>

        <!-- Ligne 4 : Description & Virement -->
        <div class="space-y-6">
          <div v-if="form.payment_method === 'transfer' && !transaction" class="animate-in slide-in-from-top-2 fade-in duration-200">
            <UiSelect v-model="form.transfer_account" label="Vers le compte" :options="availableAccounts" placeholder="Sélectionner un compte..." />
          </div>
          <UiInput v-model="form.description" label="Description" placeholder="Ex: Courses Carrefour" />
        </div>

        <div class="pt-2">
          <UiButton type="submit" :disabled="loading" class="w-full shadow-xl shadow-blue-500/10 py-3">
            {{ loading ? 'Enregistrement...' : 'Valider l\'opération' }}
          </UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>