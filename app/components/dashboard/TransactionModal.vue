<script setup lang="ts">
const props = defineProps<{ 
  show: boolean, 
  transaction?: any,
  initialData?: any,
  accountId: string
}>()
const emit = defineEmits(['close', 'success', 'delete'])

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
  pointed_at: '',
  is_recurring: false
})

const { categories, fetchCategories, categoryOptions } = useCategories()

onMounted(fetchCategories)

const subCategoryOptions = computed(() => {
  const category = form.value.category
  const cat = categories.value.find(c => c.name === category)
  // On gère le cas où sub_categories est un tableau de chaînes
  return cat && cat.sub_categories ? cat.sub_categories.map((s: string) => ({ label: s, value: s })) : []
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
    
    const source = props.transaction || props.initialData
    if (source) {
      form.value = {
        type: source.type,
        amount: Math.abs(source.amount).toString(),
        // Si c'est une duplication (initialData), on met la date d'aujourd'hui, sinon la date originale
        date: props.transaction ? source.date.split('T')[0] : new Date().toISOString().split('T')[0],
        category: source.category,
        sub_category: source.sub_category || '',
        payment_method: source.payment_method || 'card',
        transfer_account: '', // En édition, on ne gère pas le changement de compte lié pour l'instant
        description: source.description,
        // On ne reprend pas le pointage ni la récurrence lors d'une duplication
        pointed_at: props.transaction ? (source.pointed_at ? source.pointed_at.split('T')[0] : '') : '',
        is_recurring: props.transaction ? (source.is_recurring || false) : false
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
        pointed_at: '',
        is_recurring: false
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
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-3xl w-full">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-ui-content tracking-tight">
          {{ transaction ? 'Modifier l\'opération' : 'Nouvelle opération' }}
        </h3>
        <button @click="emit('close')" class="text-ui-content-muted hover:text-ui-content transition-colors">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Ligne 1 : Type & Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Type</label>
            <div class="grid grid-cols-2 gap-1 p-1 bg-ui-surface-muted rounded-lg border border-ui-border h-[52px]">
              <button 
                v-for="opt in typeOptions" 
                :key="opt.value"
                type="button"
                @click="form.type = opt.value"
                class="flex items-center justify-center text-sm font-bold rounded-md transition-all border border-transparent"
                :class="form.type === opt.value ? opt.activeClass + ' shadow-sm' : 'text-ui-content-muted hover:text-ui-content hover:bg-white/50'"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1 mb-2 block">Montant</label>
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

        <!-- Virement : Compte cible -->
        <div v-if="form.payment_method === 'transfer' && !transaction" class="animate-in slide-in-from-top-2 fade-in duration-200">
          <UiSelect v-model="form.transfer_account" label="Vers le compte" :options="availableAccounts" placeholder="Sélectionner un compte..." />
        </div>

        <!-- Ligne 3 : Catégorisation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UiSelect v-model="form.category" label="Catégorie" :options="categoryOptions" />
          <UiSelect v-model="form.sub_category" label="Sous-catégorie" :options="subCategoryOptions" placeholder="Sélectionner..." />
        </div>

        <!-- Ligne 4 : Description -->
        <div class="space-y-6">
          <UiInput v-model="form.description" label="Description" placeholder="Ex: Courses Carrefour" />
        </div>

        <div class="pt-2 flex gap-3">
          <button v-if="transaction" type="button" @click="emit('delete', transaction)" class="px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-bold transition-colors" title="Supprimer">
            <Icon name="lucide:trash-2" class="w-5 h-5" />
          </button>
          <UiButton type="submit" :disabled="loading" class="flex-1 shadow-xl shadow-blue-500/10 py-3">
            {{ loading ? 'Enregistrement...' : 'Valider l\'opération' }}
          </UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>