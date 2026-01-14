export const calculateMonthlyEffort = (targetAmount: number, savedAmount: number, deadline: string) => {
    if (!deadline || savedAmount >= targetAmount) return null
    
    const now = new Date()
    const end = new Date(deadline)
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
    
    if (months <= 0) return { amount: targetAmount - savedAmount, label: 'tout de suite' }
    
    const amount = (targetAmount - savedAmount) / months
    return { amount, label: '/ mois' }
}

export const getDeadlineBadge = (dateStr: string) => {
    if (!dateStr) return null
    const target = new Date(dateStr)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { label: 'Terminé', class: 'bg-gray-100 text-gray-600 border-gray-200' }
    if (diffDays <= 30) return { label: `J-${diffDays}`, class: 'bg-red-50 text-red-600 border-red-100' }
    return { label: target.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), class: 'bg-blue-50 text-blue-600 border-blue-100' }
}