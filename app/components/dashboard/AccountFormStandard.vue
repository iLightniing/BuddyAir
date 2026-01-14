<script setup lang="ts">
import { formatAmountDisplay, parseAmountInput } from '~/utils/format'

const props = defineProps<{
  form: any
  account?: any
  banks: any[]
  currencies: any[]
  savingsTypes: any[]
  types: any[]
  groups: any[]
  balanceOptions: any[]
  isBalanceLocked: boolean
  loading: boolean
}>()

const emit = defineEmits(['close', 'submit'])
const { notify } = useNotification()

const handleSubmit = () => {
  if (!props.form.name || !props.form.name.trim()) {
    notify('Le nom du compte est obligatoire.', 'error')
    return
  }
  emit('submit')
}
</script>

<template>
  <div class="space-y-5">
    <UiInput v-model="form.name" label="Nom du compte" placeholder="Ex: Compte Principal" required />
    
    <div class="grid grid-cols-2 gap-4">
      <UiSelect v-model="form.bank" label="Banque" :options="banks" />
      <UiSelect v-model="form.currency" label="Devise" :options="currencies" />
    </div>

    <!-- Options spécifiques Épargne -->
    <div v-if="form.group === 'savings'" class="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
       <UiSelect v-model="form.savings_type" label="Type de livret" :options="savingsTypes" />
       <div class="relative">
          <UiInput v-model="form.interest_rate" label="Taux d'intérêt" placeholder="3.00" type="number" step="0.01" />
          <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">%</span>
       </div>
    </div>

    <div v-if="form.group === 'current'">
      <UiSelect v-model="form.type" label="Type de débit" :options="types" />
    </div>

    <div class="grid grid-cols-3 gap-4 items-end">
      <div class="col-span-2">
        <UiInput 
          :model-value="formatAmountDisplay(form.balance)" 
          @update:model-value="v => form.balance = parseAmountInput(v)"
          label="Solde actuel" 
          placeholder="Ex: 1 500" 
          required :disabled="isBalanceLocked" :title="isBalanceLocked ? 'Modification impossible : des transactions existent' : ''" type="text" />
      </div>
      <UiToggle v-model="form.balanceType" label="État du solde" :options="balanceOptions" />
    </div>

    <div class="flex gap-3 pt-4">
      <UiButton @click="emit('close')" type="button" variant="secondary" class="flex-1">Annuler</UiButton>
      <UiButton @click="handleSubmit" type="button" :disabled="loading" class="flex-1 shadow-xl shadow-blue-500/20">
        {{ loading ? 'Sauvegarde...' : 'Confirmer' }}
      </UiButton>
    </div>
  </div>
</template>