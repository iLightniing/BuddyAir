<script setup lang="ts">
import { formatAmountDisplay, parseAmountInput } from '~/utils/format'
import { useCreditWizard } from '~/composables/useCreditWizard'

const props = defineProps<{
  form: any
  account?: any
  banks: any[]
  currencies: any[]
  availableCurrentAccounts: any[]
  simulation: any
  loading: boolean
}>()

const emit = defineEmits(['close', 'success'])

const {
  currentStep, repaymentDay, customMonthlyPayment, isVefa, amortizationStartDate,
  nextStep, handleSubmit
} = useCreditWizard(props, emit)
</script>

<template>
  <div>
     <!-- ÉTAPE 1 : Infos de base -->
     <div v-if="currentStep === 1" class="space-y-5 animate-in fade-in slide-in-from-right-4">
       <UiInput v-model="form.name" label="Nom du crédit" placeholder="Ex: Prêt Immo" required />
       
       <div class="grid grid-cols-2 gap-4">
         <UiSelect v-model="form.bank" label="Banque" :options="banks" />
         <UiSelect v-model="form.currency" label="Devise" :options="currencies" />
       </div>

       <div class="grid grid-cols-2 gap-4">
         <div class="relative">
            <UiInput 
              :model-value="formatAmountDisplay(form.credit_amount)" 
              @update:model-value="v => form.credit_amount = parseAmountInput(v)"
              label="Montant du prêt" 
              placeholder="0.00" 
              type="text" required />
            <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">€</span>
         </div>
         <div class="relative">
            <UiInput v-model="form.interest_rate" label="Taux d'intérêt" placeholder="3.00" type="number" step="0.01" required />
            <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">%</span>
         </div>
       </div>
       
       <div class="grid grid-cols-2 gap-4 items-end">
         <UiInput v-model="form.loan_duration" label="Durée (mois)" placeholder="240" type="number" required />
         <UiDate v-model="form.loan_start_date" :label="isVefa ? 'Date signature (Notaire)' : 'Date de début'" required />
       </div>

       <!-- Option VEFA -->
       <div class="bg-ui-surface-muted/50 p-3 rounded-lg border border-ui-border space-y-3">
          <UiSwitch v-model="isVefa" label="Crédit en VEFA / Construction" description="Déblocage progressif des fonds et différé d'amortissement." />
          <div v-if="isVefa" class="animate-in slide-in-from-top-2">
             <UiDate v-model="amortizationStartDate" label="Date de livraison prévue (Début amortissement)" required />
          </div>
       </div>

       <div class="grid grid-cols-2 gap-4">
         <div class="relative">
            <UiInput v-model="form.insurance_rate" label="Taux Assurance" placeholder="0.36" type="number" step="0.01" />
            <span class="absolute right-3 top-[34px] text-xs font-bold text-ui-content-muted">%</span>
         </div>
         <UiInput 
            :model-value="formatAmountDisplay(form.insurance_amount)" 
            @update:model-value="v => form.insurance_amount = parseAmountInput(v)"
            label="Assurance (Fixe/mois)" 
            placeholder="0.00" 
            type="text" />
       </div>
     </div>

     <!-- ÉTAPE 2 : Simulation & Solde -->
     <div v-if="currentStep === 2" class="space-y-5 animate-in fade-in slide-in-from-right-4">
        <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
          <h4 class="text-xs font-black text-blue-800 uppercase tracking-widest">Simulation théorique {{ isVefa ? '(Phase Amortissement)' : '' }}</h4>
          <div class="flex justify-between items-center">
             <span class="text-sm text-blue-700">Mensualité hors assurance</span>
             <span class="text-lg font-bold text-blue-900">{{ (simulation?.monthly ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
          </div>
          <div class="flex justify-between items-center">
             <span class="text-sm text-blue-700">Assurance mensuelle</span>
             <span class="text-lg font-bold text-blue-900">+{{ (simulation?.monthlyInsurance ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
          </div>
          <div class="border-t border-blue-200 pt-2 mt-2 flex justify-between items-center">
             <span class="text-sm font-bold text-blue-800">Total mensuel</span>
             <span class="text-xl font-black text-blue-900">{{ ((simulation?.monthly ?? 0) + (simulation?.monthlyInsurance ?? 0)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <UiInput 
              :model-value="formatAmountDisplay(form.monthly_payment)" 
              @update:model-value="v => form.monthly_payment = parseAmountInput(v)"
              :label="isVefa ? 'Mensualité (Phase Amortissement)' : 'Mensualité réelle'" 
              :placeholder="((simulation?.monthly ?? 0) + (simulation?.monthlyInsurance ?? 0)).toFixed(2)" 
              type="text" />
           <div class="relative">
              <UiInput 
                :model-value="formatAmountDisplay(form.balance)" 
                @update:model-value="v => form.balance = parseAmountInput(v)"
                :label="isVefa ? 'Montant déjà débloqué' : 'Capital restant dû'" 
                placeholder="Ex: 150 000" 
                type="text" required />
              <p class="text-[10px] text-ui-content-muted mt-1">Saisissez le montant positif, nous le convertirons en dette.</p>
           </div>
        </div>
     </div>

     <!-- ÉTAPE 3 : Remboursement -->
     <div v-if="currentStep === 3" class="space-y-6 animate-in fade-in slide-in-from-right-4">
       <div class="p-5 bg-ui-surface-muted/30 rounded-xl border border-ui-border space-y-5">
         <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest flex items-center gap-2">
           <Icon name="lucide:arrow-right-left" class="w-4 h-4" />
           Automatisation du remboursement
         </h4>
         
         <UiSelect v-model="form.repayment_account_id" label="Compte de prélèvement (Débit)" :options="availableCurrentAccounts" placeholder="Choisir un compte..." />
         
         <div v-if="form.repayment_account_id">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1 mb-1 block">Jour du mois</label>
                <div class="relative">
                  <input v-model="repaymentDay" type="number" min="1" max="31" class="w-full bg-ui-surface border border-ui-border rounded-lg px-3 py-2 text-sm font-bold focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1 mb-1 block">{{ isVefa ? 'Intérêts intercalaires (Actuel)' : 'Montant à prélever' }}</label>
                <div class="relative">
                  <input 
                    :value="formatAmountDisplay(customMonthlyPayment || form.monthly_payment || ((simulation?.monthly ?? 0) + (simulation?.monthlyInsurance ?? 0)))" 
                    @input="customMonthlyPayment = parseAmountInput(($event.target as HTMLInputElement).value)"
                    type="text" 
                    class="w-full bg-ui-surface border border-ui-border rounded-lg px-3 py-2 text-sm font-bold focus:border-blue-500 outline-none transition-all" 
                  />
                  <span class="absolute right-3 top-2 text-xs font-bold text-ui-content-muted">€</span>
                </div>
              </div>
            </div>
            <UiSwitch v-model="form.create_repayment_schedule" label="Créer l'échéance dans l'échéancier" :description="isVefa ? 'Générera le paiement des intérêts intercalaires.' : 'Générera automatiquement la transaction chaque mois.'" />
         </div>
         <div v-else class="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
           Sélectionnez un compte pour activer l'automatisation.
         </div>
       </div>
     </div>

     <!-- Navigation Wizard -->
     <div class="flex gap-3 pt-6 border-t border-ui-border mt-6">
        <UiButton v-if="currentStep > 1" @click="currentStep--" type="button" variant="secondary">Précédent</UiButton>
        <UiButton v-else @click="emit('close')" type="button" variant="secondary">Annuler</UiButton>
        
        <UiButton v-if="currentStep < 3" @click="nextStep" type="button" class="ml-auto">Suivant</UiButton>
        <UiButton v-else @click="handleSubmit" type="button" :disabled="loading" class="ml-auto shadow-xl shadow-blue-500/20">
          {{ loading ? 'Sauvegarde...' : (account ? 'Modifier le crédit' : 'Créer le crédit') }}
        </UiButton>
     </div>
  </div>
</template>