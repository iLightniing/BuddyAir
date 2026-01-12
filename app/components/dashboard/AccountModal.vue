<script setup lang="ts">
import banksList from '~/data/banks.json'
const props = defineProps<{ show: boolean, account?: any }>()
const emit = defineEmits(['close', 'success'])

// On utilise <any> pour contourner la vérification stricte des tables connues
const pb = usePocketBase()
const { notify } = useNotification()
const loading = ref(false)
const isBalanceLocked = ref(false)

const form = ref({
  name: '',
  bank: '',
  type: 'immediate',
  group: 'current',
  currency: 'EUR',
  balance: 0,
  balanceType: 'credit' // 'credit' (+) ou 'debit' (-)
})

const banks = [
  ...banksList.map(b => ({
    label: b.nom,
    value: b.nom
  })).sort((a, b) => a.label.localeCompare(b.label)),
  { label: 'Autre', value: 'Autre' }
]

const types = [
  { label: 'Débit immédiat', value: 'immediate' },
  { label: 'Débit différé', value: 'deferred' }
]
const groups = [
  { label: 'Compte courant', value: 'current' },
  { label: 'Compte Épargne', value: 'savings' },
  { label: 'Compte Crédit', value: 'credit' }
]
const currencies = [
  { label: 'Euro (€)', value: 'EUR' },
  { label: 'Dollar ($)', value: 'USD' }
]
const balanceOptions = [
  { label: 'Créditeur (+)', value: 'credit', activeClass: 'bg-ui-surface shadow-sm text-emerald-500' },
  { label: 'Débiteur (-)', value: 'debit', activeClass: 'bg-ui-surface shadow-sm text-red-500' }
]

watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    if (props.account) {
      form.value = {
        name: props.account.name,
        bank: props.account.bank,
        type: props.account.type,
        group: props.account.account_group,
        currency: props.account.currency,
        balance: Math.abs(props.account.initial_balance),
        balanceType: props.account.initial_balance < 0 ? 'debit' : 'credit'
      }
      
      // Vérification s'il y a des transactions (getList avec limit=1 pour optimiser)
      const result = await pb.collection('transactions').getList(1, 1, {
        filter: `account = "${props.account.id}"`
      })
      isBalanceLocked.value = result.totalItems > 0
    } else {
    form.value = {
      name: '',
      bank: banks[0]?.value || 'Autre',
      type: 'immediate',
      group: 'current',
      currency: 'EUR',
      balance: 0,
      balanceType: 'credit'
    }
    isBalanceLocked.value = false
    }
  }
})

const handleSubmit = async () => {
  // Récupération de l'utilisateur courant depuis le store PocketBase
  const currentUser = pb.authStore.model

  if (!currentUser) return
  loading.value = true

  const finalBalance = form.value.balanceType === 'debit' ? -Math.abs(form.value.balance) : Math.abs(form.value.balance)

  try {
  
  if (props.account) {
    const updates: any = {
      name: form.value.name,
      bank: form.value.bank,
      type: form.value.type,
      account_group: form.value.group,
      currency: form.value.currency
    }
    if (!isBalanceLocked.value) {
      updates.initial_balance = finalBalance
      updates.current_balance = finalBalance // On reset le solde courant si on change l'initial (simplification)
    }
    await pb.collection('accounts').update(props.account.id, updates)
  } else {
    await pb.collection('accounts').create({
      user_id: currentUser.id,
      name: form.value.name,
      bank: form.value.bank,
      type: form.value.type,
      account_group: form.value.group,
      currency: form.value.currency,
      initial_balance: finalBalance,
      current_balance: finalBalance
    })
  }

    notify(props.account ? 'Compte modifié !' : 'Compte créé avec succès !', 'success')
    loading.value = false
    emit('success')
    emit('close')
  } catch (error: any) {
    notify(error.message, 'error')
    loading.value = false
  }
}
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-8 rounded-md shadow-2xl max-w-xl w-full">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
          <Icon name="lucide:wallet" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-black text-ui-content tracking-tight">{{ account ? 'Modifier le compte' : 'Nouveau compte' }}</h3>
          <p class="text-xs text-ui-content-muted font-medium uppercase tracking-widest">Configuration bancaire</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UiInput v-model="form.name" label="Nom du compte" placeholder="Ex: Compte Principal" required />
        
        <div class="grid grid-cols-2 gap-4">
          <UiSelect v-model="form.bank" label="Banque" :options="banks" />
          <UiSelect v-model="form.currency" label="Devise" :options="currencies" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UiSelect v-model="form.type" label="Type de débit" :options="types" />
          <UiSelect v-model="form.group" label="Catégorie" :options="groups" />
        </div>

        <div class="grid grid-cols-3 gap-4 items-end">
          <div class="col-span-2">
            <UiInput v-model.number="form.balance" type="number" step="0.01" label="Solde initial" placeholder="0.00" required :disabled="isBalanceLocked" :title="isBalanceLocked ? 'Modification impossible : des transactions existent' : ''" />
          </div>
          <UiToggle v-model="form.balanceType" label="État du solde" :options="balanceOptions" />
        </div>

        <div class="flex gap-3 pt-4">
          <UiButton @click="emit('close')" type="button" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton type="submit" :disabled="loading" class="flex-1 shadow-xl shadow-blue-500/20">
            {{ loading ? 'Sauvegarde...' : 'Confirmer' }}
          </UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>