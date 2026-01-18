<script setup lang="ts">
import { useAccountForm } from '~/composables/useAccountForm'
import AccountFormCreditWizard from './FormCreditWizard.vue'
import AccountFormStandard from './FormStandard.vue'

const props = defineProps<{ show: boolean, account?: any, initialGroup?: string }>()
const emit = defineEmits(['close', 'success'])

const {
  form, loading, isBalanceLocked, availableCurrentAccounts,
  banks, types, groups, currencies, balanceOptions, savingsTypes,
  handleSubmit, simulation
} = useAccountForm(props, emit)

// Titre dynamique et icône selon le groupe
const modalTitle = computed(() => {
  if (props.account) return 'Modifier le compte'
  if (form.value.group === 'savings') return 'Nouveau compte épargne'
  if (form.value.group === 'credit') return 'Nouveau crédit'
  return 'Nouveau compte courant'
})

const modalIcon = computed(() => {
  if (form.value.group === 'savings') return 'lucide:piggy-bank'
  if (form.value.group === 'credit') return 'lucide:landmark'
  return 'lucide:credit-card'
})

// Reset du wizard à l'ouverture
watch(() => props.show, (val) => {
  if (val) {
    // Correction du type : on assigne 0 (number) au lieu de '' (string)
    form.value.balance = 0 
  }
})
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-8 rounded-md shadow-2xl w-full transition-all duration-300 max-h-[90vh]" :class="form.group === 'credit' ? 'max-w-4xl overflow-y-auto' : 'max-w-xl overflow-visible'">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="form.group === 'credit' ? 'bg-orange-50 text-orange-600' : (form.group === 'savings' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')">
          <Icon :name="modalIcon" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-black text-ui-content tracking-tight">{{ modalTitle }}</h3>
          <p class="text-xs text-ui-content-muted font-medium uppercase tracking-widest">Configuration bancaire</p>
        </div>
      </div>

      <AccountFormCreditWizard
        v-if="form.group === 'credit'"
        :form="form"
        :account="account"
        :banks="banks"
        :currencies="currencies"
        :available-current-accounts="availableCurrentAccounts"
        :simulation="simulation"
        :loading="loading"
        @close="emit('close')"
        @success="emit('success')"
      />

      <AccountFormStandard
        v-else
        :form="form"
        :account="account"
        :banks="banks"
        :currencies="currencies"
        :savings-types="savingsTypes"
        :types="types"
        :groups="groups"
        :balance-options="balanceOptions"
        :is-balance-locked="isBalanceLocked"
        :loading="loading"
        @close="emit('close')"
        @submit="handleSubmit"
      />
    </div>
  </UiModal>
</template>