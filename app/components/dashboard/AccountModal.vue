<script setup lang="ts">
import { useAccountForm } from '~/composables/useAccountForm'

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
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-8 rounded-md shadow-2xl w-full transition-all duration-300 max-h-[90vh] overflow-y-auto" :class="form.group === 'credit' ? 'max-w-4xl' : 'max-w-xl'">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="form.group === 'credit' ? 'bg-orange-50 text-orange-600' : (form.group === 'savings' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')">
          <Icon :name="modalIcon" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-black text-ui-content tracking-tight">{{ modalTitle }}</h3>
          <p class="text-xs text-ui-content-muted font-medium uppercase tracking-widest">Configuration bancaire</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
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

        <!-- Options spécifiques Crédit -->
        <div v-if="form.group === 'credit'" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
           <!-- Colonne Gauche : Caractéristiques -->
           <div class="space-y-4">
             <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-2">Caractéristiques du prêt</h4>
             <div class="grid grid-cols-2 gap-4">
               <div class="relative">
                  <UiInput v-model="form.credit_amount" label="Montant" placeholder="0.00" type="number" />
                  <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">€</span>
               </div>
               <div class="relative">
                  <UiInput v-model="form.interest_rate" label="Taux" placeholder="3.00" type="number" step="0.01" />
                  <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">%</span>
               </div>
             </div>
             
             <div class="grid grid-cols-2 gap-4">
               <UiInput v-model="form.loan_duration" label="Durée (mois)" placeholder="240" type="number" />
               <UiDate v-model="form.loan_start_date" label="Début" />
             </div>

            <div class="grid grid-cols-2 gap-4">
               <div class="relative">
                  <UiInput v-model="form.insurance_rate" label="Taux Assurance" placeholder="0.36" type="number" step="0.01" />
                  <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">%</span>
               </div>
               <UiInput v-model="form.insurance_amount" label="Assurance (Fixe)" placeholder="0.00" type="number" />
            </div>

             <div class="relative">
                <UiInput v-model="form.monthly_payment" label="Mensualité" placeholder="0.00" type="number" />
                <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">€/mois</span>
             </div>
           </div>

           <!-- Colonne Droite : Flux -->
           <div class="p-5 bg-ui-surface-muted/30 rounded-xl border border-ui-border space-y-5 h-full">
             <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest">Flux financiers</h4>
             
             <!-- VEFA / Déblocage -->
             <UiSwitch v-model="form.is_progressive_release" label="Déblocage progressif (VEFA / Travaux)" description="L'argent n'est pas versé immédiatement en totalité." />
             
             <div v-if="!form.is_progressive_release" class="pt-2">
                <UiSelect v-model="form.linked_account_id" label="Compte de versement (Crédit)" :options="availableCurrentAccounts" placeholder="Choisir un compte..." :disabled="!!account" />
             </div>

             <!-- Remboursement -->
             <UiSelect v-model="form.repayment_account_id" label="Compte de prélèvement (Débit)" :options="availableCurrentAccounts" placeholder="Choisir un compte..." />
             
             <div v-if="form.repayment_account_id && !account">
                <UiSwitch v-model="form.create_repayment_schedule" label="Créer l'échéance mensuelle automatiquement" />
             </div>

             <!-- Simulation Pro -->
             <div v-if="simulation" class="mt-4 pt-4 border-t border-ui-border">
                <div class="flex justify-between items-center mb-1">
                   <span class="text-xs text-ui-content-muted">Mensualité théorique</span>
                   <span class="text-sm font-bold text-ui-content">{{ simulation.monthly.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
                </div>
               <div class="flex justify-between items-center mb-1" v-if="simulation.monthlyInsurance > 0">
                  <span class="text-xs text-ui-content-muted">Dont assurance</span>
                  <span class="text-xs font-bold text-ui-content-muted">{{ simulation.monthlyInsurance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
               </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-ui-content-muted">Coût total crédit</span>
                   <span class="text-xs font-bold text-red-500">{{ simulation.totalCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
                </div>
             </div>
           </div>
        </div>

        <div class="grid grid-cols-2 gap-4" v-if="form.group === 'current'">
          <UiSelect v-model="form.type" label="Type de débit" :options="types" />
          <!-- On cache le sélecteur de groupe si on est en mode création spécifique, mais on le garde pour l'édition -->
          <UiSelect v-model="form.group" label="Catégorie" :options="groups" :disabled="!account" />
        </div>

        <div class="grid grid-cols-3 gap-4 items-end">
          <div class="col-span-2">
            <UiInput v-model.number="form.balance" type="number" step="0.01" :label="form.group === 'credit' ? 'Reste à rembourser' : 'Solde actuel'" placeholder="0.00" required :disabled="isBalanceLocked" :title="isBalanceLocked ? 'Modification impossible : des transactions existent' : ''" />
          </div>
          <UiToggle v-if="form.group !== 'credit'" v-model="form.balanceType" label="État du solde" :options="balanceOptions" />
          <div v-else class="h-10 flex items-center justify-center bg-red-50 text-red-600 font-bold text-xs rounded-md border border-red-100">Dette (Négatif)</div>
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