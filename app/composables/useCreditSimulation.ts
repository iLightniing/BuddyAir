import { calculateCreditSimulation } from '~/utils/credit'

export const useCreditSimulation = (form: Ref<any>) => {
  const simulation = computed(() => {
    if (form.value.group !== 'credit') return null
    const amount = parseFloat(form.value.credit_amount || '0')
    const rate = parseFloat(form.value.interest_rate || '0')
    const duration = parseFloat(form.value.loan_duration || '0')
    const insuranceRate = parseFloat(form.value.insurance_rate || '0')
    const insuranceFixed = parseFloat(form.value.insurance_amount || '0')

    return calculateCreditSimulation(amount, rate, duration, insuranceRate, insuranceFixed)
  })

  // Calcul automatique de la mensualité dans le formulaire
  watch(simulation, (val) => {
    if (val) {
      form.value.monthly_payment = val.monthly.toFixed(2)
    }
  })

  return { simulation }
}