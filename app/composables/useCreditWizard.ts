import { formatAmountDisplay, parseAmountInput } from '~/utils/format'
import { getNextOccurrences } from '~/utils/schedule'

export const useCreditWizard = (props: any, emit: any) => {
  const pb = usePocketBase()
  const { notify } = useNotification()

  const currentStep = ref(1)
  const repaymentDay = ref(1)
  const customMonthlyPayment = ref<number | null>(null)
  const isVefa = ref(false)
  const amortizationStartDate = ref('')

  const nextStep = () => {
    if (currentStep.value === 1) {
      if (!props.form.name || !props.form.name.trim()) { notify('Le nom du crédit est requis.', 'error'); return }
      if (!props.form.credit_amount) { notify('Le montant du crédit est requis.', 'error'); return }
      if (!props.form.interest_rate) { notify('Le taux d\'intérêt est requis.', 'error'); return }
      if (!props.form.loan_duration) { notify('La durée est requise.', 'error'); return }
      if (!props.form.loan_start_date) { notify('La date de début est requise.', 'error'); return }
    }
    currentStep.value++
  }

  // Initialisation
  onMounted(() => {
    if (props.account) {
      isVefa.value = props.account.is_vefa || false
      amortizationStartDate.value = props.account.amortization_start_date ? props.account.amortization_start_date.split('T')[0] : ''
      // Conversion en positif pour l'affichage
      if (props.form.balance < 0) props.form.balance = Math.abs(props.form.balance)
    }
  })

  const handleSubmit = async () => {
    try {
      const user = pb.authStore.model
      const accountData = {
        ...props.form,
        user: user?.id,
        account_group: 'credit',
        is_vefa: isVefa.value,
        amortization_start_date: isVefa.value ? new Date(amortizationStartDate.value).toISOString() : null,
        current_balance: -Math.abs(Number(props.form.balance)),
      }

      let record
      if (props.account) {
        record = await pb.collection('accounts').update(props.account.id, accountData)
        notify('Crédit mis à jour avec succès', 'success')
      } else {
        record = await pb.collection('accounts').create(accountData)
      }

      // Création de l'échéance (seulement en création)
      if (!props.account && props.form.create_repayment_schedule && props.form.repayment_account_id) {
         const amount = customMonthlyPayment.value || Number(props.form.monthly_payment) || props.simulation?.monthly || 0
         const nextDates = getNextOccurrences(new Date().toISOString(), 'monthly', repaymentDay.value, true, 2)
         const nextDate = nextDates[0] ? nextDates[0].toISOString() : new Date().toISOString()

         const scheduleData = {
             user: user?.id,
             account: props.form.repayment_account_id,
             type: 'expense',
             amount: Math.abs(amount),
             description: isVefa.value ? `Intérêts intercalaires ${props.form.name}` : `Remboursement ${props.form.name}`,
             category: 'Autre',
             sub_category: '',
             shift_weekends: false,
             start_date: new Date().toISOString(),
             frequency: 'monthly',
             day_of_month: repaymentDay.value,
             next_date: nextDate,
             payment_method: 'transfer',
             transfer_account: record.id
         }

         try {
           await pb.collection('scheduled_transactions').create(scheduleData)
         } catch (err: any) {
           notify(`Compte créé, mais échéance échouée: ${err.message}`, "error")
           emit('success')
           return
         }
      }

      if (!props.account) notify('Crédit configuré avec succès', 'success')
      emit('success')
      emit('close')
    } catch (e: any) {
      notify(e.message || "Erreur lors de la création", "error")
    }
  }

  return {
    currentStep, repaymentDay, customMonthlyPayment, isVefa, amortizationStartDate,
    nextStep, handleSubmit
  }
}