export const useCreditAnalysis = (account: Ref<any>) => {
  const amortizationSchedule = computed(() => {
    if (!account.value || account.value.account_group !== 'credit' || !account.value.credit_amount || !account.value.interest_rate || !account.value.loan_duration) return []

    const acc = account.value
    const amount = acc.credit_amount
    const rate = acc.interest_rate / 100 / 12
    const duration = acc.loan_duration
    const startDate = new Date(acc.loan_start_date || new Date())
    const insuranceRate = (acc.insurance_rate || 0) / 100
    const insuranceFixed = acc.insurance_amount || 0
    const calculatedPayment = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1)
    const theoreticalPayment = acc.monthly_payment || calculatedPayment

    // --- Mode "Pro" : Hybride Réel / Théorique ---
    // 1. On détermine où on en est dans le temps
    const now = new Date()
    const start = new Date(startDate)
    
    // Calcul du nombre de mois écoulés depuis le début
    const monthsElapsed = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
    
    // Si on a un solde actuel (réel), on l'utilise comme point de départ pour le futur
    // Le solde en base est négatif pour une dette, on prend sa valeur absolue
    const currentRealBalance = Math.abs(acc.current_balance)
    
    let balance = amount // Solde théorique de départ
    const rows = []

    for (let i = 1; i <= duration; i++) {
      // Si on est dans le futur (après les mois écoulés), on recalcule basé sur le solde réel
      // Cela permet de voir l'impact des remboursements anticipés
      if (i === monthsElapsed + 1) {
         balance = currentRealBalance
      }

      const interest = balance * rate
      // Si le solde est plus petit que la mensualité, on solde tout
      const principal = Math.min(balance, theoreticalPayment - interest)
      balance -= principal
      const insurance = (amount * insuranceRate) / 12 + insuranceFixed
      const date = new Date(startDate)
      date.setMonth(startDate.getMonth() + i)

      rows.push({ 
        id: i, 
        date, 
        payment: principal + interest, // La mensualité peut varier à la toute fin
        interest, 
        principal, 
        insurance, 
        balance: Math.max(0, balance),
        isPast: date < now // Marqueur pour le style
      })
      
      if (balance <= 0) break
    }
    return rows
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