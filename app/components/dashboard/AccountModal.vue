<script setup lang="ts">
const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'success'])

// On utilise <any> pour contourner la vérification stricte des tables connues
const supabase = useSupabaseClient<any>()
const user = useSupabaseUser()
const { notify } = useNotification()
const loading = ref(false)

const form = ref({
  name: '',
  bank: 'Revolut',
  type: 'immediate',
  group: 'current',
  currency: 'EUR',
  balance: 0,
  balanceType: 'credit' // 'credit' (+) ou 'debit' (-)
})

const banks = [
  { label: 'Revolut', value: 'Revolut' },
  { label: 'BoursoBank', value: 'BoursoBank' },
  { label: 'BNP Paribas', value: 'BNP Paribas' },
  { label: 'Société Générale', value: 'Société Générale' },
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

const handleCreate = async () => {
  if (!user.value) return
  loading.value = true

  const finalBalance = form.value.balanceType === 'debit' ? -Math.abs(form.value.balance) : Math.abs(form.value.balance)

  const { error } = await supabase.from('accounts').insert({
    user_id: user.value.id,
    name: form.value.name,
    bank: form.value.bank,
    type: form.value.type,
    account_group: form.value.group,
    currency: form.value.currency,
    initial_balance: finalBalance,
    current_balance: finalBalance
  })

  if (error) {
    notify(error.message, 'error')
    loading.value = false
  } else {
    notify('Compte créé avec succès !', 'success')
    loading.value = false
    emit('success')
    emit('close')
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
          <h3 class="text-xl font-black text-ui-content tracking-tight">Nouveau compte</h3>
          <p class="text-xs text-ui-content-muted font-medium uppercase tracking-widest">Configuration bancaire</p>
        </div>
      </div>

      <form @submit.prevent="handleCreate" class="space-y-5">
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
            <UiInput v-model.number="form.balance" type="number" step="0.01" label="Solde initial" placeholder="0.00" required />
          </div>
          <UiToggle v-model="form.balanceType" label="État du solde" :options="balanceOptions" />
        </div>

        <div class="flex gap-3 pt-4">
          <UiButton @click="emit('close')" type="button" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton type="submit" :disabled="loading" class="flex-1 shadow-xl shadow-blue-500/20">
            {{ loading ? 'Création...' : 'Confirmer' }}
          </UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>