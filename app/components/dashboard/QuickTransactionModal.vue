<script setup lang="ts">

interface Account {
  id: string
  name: string
  current_balance: number
}

const props = defineProps<{
  show: boolean
  accounts: Account[]
}>()

const emit = defineEmits(['close', 'success'])

const pb = usePocketBase()
const user = usePocketBaseUser()
const { notify } = useNotification()

const loading = ref(false)
const transactionType = ref<'expense' | 'income'>('expense')
const amount = ref<number | null>(null)
const description = ref('')
const selectedAccount = ref('')
const amountInput = ref<HTMLInputElement | null>(null)

const accountOptions = computed(() => props.accounts.map(a => ({
  label: `${a.name} (${a.current_balance.toLocaleString('fr-FR')} €)`,
  value: a.id
})))

watch(() => props.show, (newValue) => {
  if (newValue) {
    // Reset form on open
    transactionType.value = 'expense'
    amount.value = null
    description.value = ''
    // Pre-select first account if available
    selectedAccount.value = props.accounts[0]?.id ?? ''
    
    // Focus automatique sur le montant
    nextTick(() => amountInput.value?.focus())
  }
})

const handleSubmit = async () => {
  if (!user.value || !selectedAccount.value || !amount.value || amount.value <= 0) {
    notify('Veuillez remplir tous les champs obligatoires.', 'error')
    return
  }

  loading.value = true
  try {
    // 1. Create transaction
    await pb.collection('transactions').create({
      user: user.value.id,
      account: selectedAccount.value,
      type: transactionType.value,
      amount: amount.value,
      description: description.value || (transactionType.value === 'expense' ? 'Dépense rapide' : 'Revenu rapide'),
      date: new Date().toISOString(),
      category: 'Divers',
      payment_method: 'other',
      status: 'completed',
      pointed_at: new Date().toISOString()
    })

    // 2. Update account balance
    const accountToUpdate = props.accounts.find(a => a.id === selectedAccount.value)
    if (accountToUpdate) {
      const newBalance = transactionType.value === 'expense'
        ? accountToUpdate.current_balance - amount.value
        : accountToUpdate.current_balance + amount.value
      await pb.collection('accounts').update(selectedAccount.value, { current_balance: newBalance })
    }

    notify('Transaction ajoutée avec succès!', 'success')
    emit('success')
    emit('close')
  } catch (e) {
    console.error(e)
    notify('Erreur lors de l\'ajout de la transaction.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-ui-border">
        <h2 class="text-lg font-bold text-ui-content">Transaction Rapide</h2>
        <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-ui-surface-muted text-ui-content-muted hover:text-ui-content transition-colors" title="Fermer">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Type Toggle -->
          <div class="grid grid-cols-2 gap-2 p-1 bg-ui-surface-muted rounded-lg">
            <button type="button" @click="transactionType = 'expense'" :class="['py-2 rounded-md text-sm font-bold', transactionType === 'expense' ? 'bg-white shadow text-red-600' : 'text-ui-content-muted hover:bg-white/50']">Dépense</button>
            <button type="button" @click="transactionType = 'income'" :class="['py-2 rounded-md text-sm font-bold', transactionType === 'income' ? 'bg-white shadow text-emerald-600' : 'text-ui-content-muted hover:bg-white/50']">Revenu</button>
          </div>

          <!-- Amount -->
          <div class="relative">
            <input ref="amountInput" v-model.number="amount" type="number" step="0.01" placeholder="0.00" class="w-full text-4xl font-bold text-center bg-transparent focus:outline-none transition-colors" :class="transactionType === 'expense' ? 'text-red-600' : 'text-emerald-600'" />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-ui-content-muted">€</span>
          </div>

          <!-- Description -->
          <UiInput v-model="description" label="Description" placeholder="Ex: Courses, Restaurant..." />

          <!-- Account -->
          <UiSelect v-model="selectedAccount" label="Compte" :options="accountOptions" />

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <UiButton type="button" variant="ghost" @click="$emit('close')">Annuler</UiButton>
            <UiButton type="submit" variant="primary" :loading="loading">
              <Icon name="lucide:check" class="w-4 h-4 mr-2" />
              Ajouter
            </UiButton>
          </div>
        </form>
      </div>
    </div>
  </UiModal>
</template>