import { useAccountConstants } from './useAccountConstants'
import { useCreditSimulation } from './useCreditSimulation'

export function useAccountForm(props: any, emit: any) {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()
  
  const loading = ref(false)
  const isBalanceLocked = ref(false)
  const availableCurrentAccounts = ref<any[]>([])

  const form = ref({
    name: '',
    bank: '',
    type: 'immediate',
    group: 'current',
    currency: 'EUR',
    balance: 0,
    balanceType: 'credit',
    savings_type: '',
    interest_rate: '',
    credit_amount: '',
    monthly_payment: '',
    loan_duration: '',
    loan_start_date: new Date().toISOString().split('T')[0],
    insurance_rate: '',
    insurance_amount: '',
    linked_account_id: '',
    repayment_account_id: '',
    is_progressive_release: false,
    create_repayment_schedule: true
  })

  // --- Constantes ---
  const { banks, types, groups, currencies, balanceOptions, savingsTypes } = useAccountConstants()

  // --- Simulation Crédit ---
  const { simulation } = useCreditSimulation(form)

  // --- Logique ---
  const fetchCurrentAccounts = async () => {
    // On utilise pb.authStore.model en fallback si user.value n'est pas prêt
    const userId = user.value?.id || pb.authStore.model?.id
    if (!userId) return

    try {
      const accounts = await pb.collection('accounts').getFullList({ 
          filter: `user = "${userId}" && account_group = "current"`,
          sort: '+name' 
      })
      availableCurrentAccounts.value = accounts.map(acc => ({ label: acc.name, value: acc.id }))
    } catch (e) { console.error("Erreur chargement comptes courants", e) }
  }

  const initForm = async () => {
    fetchCurrentAccounts()
    if (props.account) {
      form.value = {
        name: props.account.name,
        bank: props.account.bank,
        type: props.account.type,
        group: props.account.account_group,
        currency: props.account.currency,
        balance: Math.abs(props.account.initial_balance),
        balanceType: props.account.initial_balance < 0 ? 'debit' : 'credit',
        savings_type: props.account.savings_type || '',
        interest_rate: props.account.interest_rate || '',
        credit_amount: props.account.credit_amount || '',
        monthly_payment: props.account.monthly_payment || '',
        loan_duration: props.account.loan_duration || '',
        loan_start_date: props.account.loan_start_date ? props.account.loan_start_date.split('T')[0] : new Date().toISOString().split('T')[0],
        insurance_rate: props.account.insurance_rate || '',
        insurance_amount: props.account.insurance_amount || '',
        linked_account_id: '',
        repayment_account_id: props.account.repayment_account_id || '',
        is_progressive_release: props.account.is_progressive_release || false,
        create_repayment_schedule: false
      }
      
      const result = await pb.collection('transactions').getList(1, 1, {
        filter: `account = "${props.account.id}"`
      })
      isBalanceLocked.value = result.totalItems > 0
    } else {
      form.value = {
        name: '',
        bank: banks[0]?.value || 'Autre',
        type: 'immediate',
        group: props.initialGroup || 'current',
        currency: 'EUR',
        balance: 0,
        balanceType: (props.initialGroup === 'credit') ? 'debit' : 'credit',
        savings_type: '',
        interest_rate: '',
        credit_amount: '',
        monthly_payment: '',
        loan_duration: '',
        loan_start_date: new Date().toISOString().split('T')[0],
        insurance_rate: '',
        insurance_amount: '',
        linked_account_id: '',
        repayment_account_id: '',
        is_progressive_release: false,
        create_repayment_schedule: true
      }
      isBalanceLocked.value = false
    }
  }

  watch(() => props.show, (isOpen) => {
    if (isOpen) initForm()
  })

  const handleSubmit = async () => {
    const userId = user.value?.id || pb.authStore.model?.id
    if (!userId) return
    loading.value = true

    const finalBalance = form.value.balanceType === 'debit' ? -Math.abs(form.value.balance) : Math.abs(form.value.balance)

    try {
      const accountData: any = {
        name: form.value.name,
        bank: form.value.bank,
        type: form.value.type,
        account_group: form.value.group,
        currency: form.value.currency,
        savings_type: form.value.savings_type,
        interest_rate: form.value.interest_rate,
        credit_amount: form.value.credit_amount,
        monthly_payment: form.value.monthly_payment,
        loan_duration: form.value.loan_duration,
        loan_start_date: new Date(form.value.loan_start_date || new Date()).toISOString(),
        insurance_rate: form.value.insurance_rate,
        insurance_amount: form.value.insurance_amount,
        repayment_account_id: form.value.repayment_account_id,
        is_progressive_release: form.value.is_progressive_release
      }

      if (props.account) {
        if (!isBalanceLocked.value) {
          accountData.initial_balance = finalBalance
          accountData.current_balance = finalBalance
        }
        await pb.collection('accounts').update(props.account.id, accountData)
      } else {
        accountData.user = userId
        accountData.initial_balance = finalBalance
        accountData.current_balance = finalBalance
        
        const newAccount = await pb.collection('accounts').create(accountData)

        // Logique Crédit : Transaction liée
        if (form.value.group === 'credit' && !form.value.is_progressive_release && form.value.linked_account_id && finalBalance !== 0) {
          await pb.collection('transactions').create({
            user: userId,
            account: form.value.linked_account_id,
            type: 'income',
            amount: Math.abs(finalBalance),
            category: 'Virement',
            description: `Apport du crédit ${form.value.name}`,
            date: new Date().toISOString(),
            payment_method: 'transfer',
            status: 'completed',
            pointed_at: new Date().toISOString(),
            related_transaction: newAccount.id
          })
          const linkedAccount = await pb.collection('accounts').getOne(form.value.linked_account_id)
          await pb.collection('accounts').update(form.value.linked_account_id, { current_balance: linkedAccount.current_balance + Math.abs(finalBalance) })
        }

        // Logique Crédit : Échéancier
        if (form.value.group === 'credit' && form.value.create_repayment_schedule && form.value.repayment_account_id && form.value.monthly_payment) {
          await pb.collection('scheduled_transactions').create({
            user: userId,
            account: form.value.repayment_account_id,
            type: 'expense',
            amount: parseFloat(form.value.monthly_payment),
            start_date: form.value.loan_start_date,
            description: `Remboursement crédit ${form.value.name}`,
            category: 'Remboursement emprunt',
            frequency: 'monthly',
            day_of_month: new Date(form.value.loan_start_date || new Date()).getDate(),
            shift_weekends: true,
            next_date: new Date(form.value.loan_start_date || new Date()).toISOString()
          })
        }
      }

      notify(props.account ? 'Compte modifié !' : 'Compte créé avec succès !', 'success')
      emit('success')
      emit('close')
    } catch (error: any) {
      notify(error.message, 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    form, loading, isBalanceLocked, availableCurrentAccounts,
    banks, types, groups, currencies, balanceOptions, savingsTypes,
    handleSubmit, simulation
  }
}