// app/utils/account.ts

export const getLoanEndDate = (acc: any) => {
  if (!acc.loan_start_date || !acc.loan_duration) return 'Inconnue'
  const end = new Date(acc.loan_start_date)
  end.setMonth(end.getMonth() + acc.loan_duration)
  return end.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

export const getRemainingDuration = (acc: any) => {
  if (!acc.loan_start_date || !acc.loan_duration) return null
  const start = new Date(acc.loan_start_date)
  const end = new Date(start)
  end.setMonth(start.getMonth() + acc.loan_duration)
  
  const now = new Date()
  if (now > end) return 'Terminé'
  
  const diffTime = Math.abs(end.getTime() - now.getTime())
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)) 
  
  if (diffMonths > 12) {
      const years = Math.floor(diffMonths / 12)
      const months = diffMonths % 12
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ' ' + months + ' mois' : ''}`
  }
  return `${diffMonths} mois`
}

export const calculateYearlyInterest = (acc: any) => {
  return (acc.current_balance * (acc.interest_rate / 100)).toLocaleString('fr-FR', { style: 'currency', currency: acc.currency })
}

export const calculateMonthlyInterest = (acc: any) => {
  return ((acc.current_balance * (acc.interest_rate / 100)) / 12).toLocaleString('fr-FR', { style: 'currency', currency: acc.currency })
}