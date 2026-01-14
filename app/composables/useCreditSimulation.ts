export const useCreditSimulation = (form: Ref<any>) => {
  const simulation = computed(() => {
    if (form.value.group !== 'credit') return null
    const amount = parseFloat(form.value.credit_amount || '0')
    const rate = parseFloat(form.value.interest_rate || '0') / 100 / 12
    const duration = parseFloat(form.value.loan_duration || '0')
    const insuranceRate = parseFloat(form.value.insurance_rate || '0') / 100
    const insuranceFixed = parseFloat(form.value.insurance_amount || '0')

    if (!amount || !duration) return null
    
    const monthly = rate > 0 ? (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1) : amount / duration
    const monthlyInsurance = (amount * insuranceRate) / 12 + insuranceFixed
    const totalCost = ((monthly + monthlyInsurance) * duration) - amount
    
    return { monthly: monthly + monthlyInsurance, totalCost, monthlyInsurance }
  })

  // Calcul automatique de la mensualité dans le formulaire
  watch(simulation, (val) => {
    if (val) {
      form.value.monthly_payment = val.monthly.toFixed(2)
    }
  })

  return { simulation }
}