import { getNextOccurrences } from '~/utils/schedule'

export const useScheduleForm = (props: any, emit: any) => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const loading = ref(false)
  const accounts = ref<any[]>([])

  const form = ref({
    type: 'expense',
    amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    account: '',
    category: 'Autre',
    sub_category: '',
    description: '',
    frequency: 'monthly',
    day_of_month: new Date().getDate(),
    shift_weekends: false,
    generate_now: false,
    payment_method: 'direct_debit',
    tags: [] as string[]
  })

  const fetchAccounts = async () => {
    try {
      const res = await pb.collection('accounts').getFullList({ sort: '+name' })
      accounts.value = res.map(a => ({ label: a.name, value: a.id }))
    } catch {}
  }

  const initForm = () => {
    fetchAccounts()
    if (props.item) {
      form.value = {
        type: props.item.type,
        amount: props.item.amount.toString(),
        start_date: props.item.start_date ? props.item.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: props.item.end_date ? props.item.end_date.split('T')[0] : '',
        account: props.item.account,
        category: props.item.category,
        sub_category: props.item.sub_category || '',
        description: props.item.description,
        frequency: props.item.frequency,
        day_of_month: props.item.day_of_month || new Date().getDate(),
        shift_weekends: props.item.shift_weekends || false,
        generate_now: false,
        payment_method: props.item.payment_method || 'direct_debit',
        tags: props.item.tags || []
      }
    } else {
      form.value = {
        type: 'expense',
        amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        account: props.preselectedAccountId || (accounts.value[0]?.value || ''),
        category: 'Autre',
        sub_category: '',
        description: '',
        frequency: 'monthly',
        day_of_month: new Date().getDate(),
        shift_weekends: false,
        generate_now: false,
        payment_method: 'direct_debit',
        tags: []
      }
    }
  }

  watch(() => props.show, (isOpen) => {
    if (isOpen) initForm()
  })

  const handleSubmit = async () => {
    loading.value = true
    const user = pb.authStore.model

    if (!user) {
      notify("Vous devez être connecté.", "error")
      loading.value = false
      return
    }
    
    try {
      const amountValue = parseFloat(form.value.amount)
      if (isNaN(amountValue)) throw new Error("Montant invalide")

      // Calcul de la prochaine date
      const nextDates = getNextOccurrences(
        new Date(form.value.start_date).toISOString(), 
        form.value.frequency, 
        form.value.day_of_month, 
        form.value.shift_weekends, 
        1
      )
      const nextDate = nextDates[0] ? nextDates[0].toISOString() : new Date().toISOString()

      const data = {
        user: user.id,
        account: form.value.account,
        type: form.value.type,
        amount: Math.abs(amountValue),
        start_date: new Date(form.value.start_date).toISOString(),
        end_date: form.value.end_date ? new Date(form.value.end_date).toISOString() : null,
        description: form.value.description,
        category: form.value.category,
        sub_category: form.value.sub_category,
        frequency: form.value.frequency,
        day_of_month: form.value.day_of_month,
        shift_weekends: form.value.shift_weekends,
        next_date: nextDate,
        payment_method: form.value.payment_method,
        tags: form.value.tags
      }

      if (props.item) {
        await pb.collection('scheduled_transactions').update(props.item.id, data)
      } else {
        await pb.collection('scheduled_transactions').create(data)
      }

      // Génération immédiate si demandée (Logique simplifiée ici, idéalement via useScheduleGenerator)
      if (form.value.generate_now) {
         // ... (Logique de génération immédiate si nécessaire, sinon gérée par le backend/cron)
         // Pour l'instant on laisse le générateur global s'en charger au prochain check
         // ou on peut appeler checkAndGenerate() depuis le composant parent
      }

      notify(props.item ? 'Échéance modifiée' : 'Échéance créée', 'success')
      emit('success')
      emit('close')
    } catch (e: any) {
      notify(e.message || "Erreur", "error")
    } finally {
      loading.value = false
    }
  }

  return { form, loading, accounts, handleSubmit }
}