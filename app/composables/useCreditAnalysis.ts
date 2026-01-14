import { calculateAmortizationSchedule } from '~/utils/credit'

export const useCreditAnalysis = (account: Ref<any>) => {
  const amortizationSchedule = computed(() => {
    if (!account.value || account.value.account_group !== 'credit' || !account.value.credit_amount || !account.value.interest_rate || !account.value.loan_duration) return []

    const acc = account.value
    return calculateAmortizationSchedule({
      amount: acc.credit_amount,
      interestRate: acc.interest_rate,
      duration: acc.loan_duration,
      startDate: acc.loan_start_date,
      insuranceRate: acc.insurance_rate,
      insuranceAmount: acc.insurance_amount,
      monthlyPayment: acc.monthly_payment,
      currentBalance: acc.current_balance
    })
  })

  const creditAnalysis = computed(() => {
    if (account.value?.account_group !== 'credit' || !amortizationSchedule.value.length) return null
    
    const totalInterest = amortizationSchedule.value.reduce((sum, row) => sum + row.interest, 0)
    const totalInsurance = amortizationSchedule.value.reduce((sum, row) => sum + row.insurance, 0)
    const capital = account.value.credit_amount || 0
    const totalCost = capital + totalInterest + totalInsurance

    return {
      capital, totalInterest, totalInsurance, totalCost,
      capitalPercent: totalCost > 0 ? (capital / totalCost) * 100 : 0,
      interestPercent: totalCost > 0 ? (totalInterest / totalCost) * 100 : 0,
      insurancePercent: totalCost > 0 ? (totalInsurance / totalCost) * 100 : 0,
    }
  })

  return { amortizationSchedule, creditAnalysis }
}