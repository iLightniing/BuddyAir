export interface CreditParams {
  amount: number
  interestRate: number
  duration: number
  startDate: string | Date
  insuranceRate?: number
  insuranceAmount?: number
  monthlyPayment?: number
  currentBalance?: number
}

export const calculateAmortizationSchedule = (params: CreditParams) => {
  const { amount, interestRate, duration, startDate, insuranceRate = 0, insuranceAmount = 0, monthlyPayment, currentBalance } = params
  
  if (!amount || !interestRate || !duration) return []

  const rate = interestRate / 100 / 12
  const start = new Date(startDate || new Date())
  const insRate = (insuranceRate || 0) / 100
  const insFixed = insuranceAmount || 0
  
  const calculatedPayment = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1)
  const theoreticalPayment = monthlyPayment || calculatedPayment

  // Mode "Pro" : Hybride Réel / Théorique
  const now = new Date()
  const monthsElapsed = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
  const currentRealBalance = currentBalance !== undefined ? Math.abs(currentBalance) : amount
  
  let balance = amount
  const rows = []

  for (let i = 1; i <= duration; i++) {
    if (currentBalance !== undefined && i === monthsElapsed + 1) {
       balance = currentRealBalance
    }

    const interest = balance * rate
    const principal = Math.min(balance, theoreticalPayment - interest)
    balance -= principal
    const insurance = (amount * insRate) / 12 + insFixed
    
    const date = new Date(start)
    date.setMonth(start.getMonth() + i)

    rows.push({ 
      id: i, 
      date, 
      payment: principal + interest, 
      interest, 
      principal, 
      insurance, 
      balance: Math.max(0, balance),
      isPast: date < now
    })
    
    if (balance <= 0) break
  }
  return rows
}

export const calculateCreditSimulation = (amount: number, interestRate: number, duration: number, insuranceRate: number = 0, insuranceFixed: number = 0) => {
  if (!amount || !duration) return null
  
  const rate = interestRate / 100 / 12
  const insRate = insuranceRate / 100
  
  const monthly = rate > 0 ? (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1) : amount / duration
  const monthlyInsurance = (amount * insRate) / 12 + insuranceFixed
  const totalCost = ((monthly + monthlyInsurance) * duration) - amount
  
  return { monthly: monthly + monthlyInsurance, totalCost, monthlyInsurance }
}