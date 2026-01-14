export const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 85) return 'bg-orange-500'
  return 'bg-emerald-500'
}

export const getPaceStatus = (percentage: number, currentDate: Date) => {
  const now = new Date()
  if (currentDate.getMonth() !== now.getMonth() || currentDate.getFullYear() !== now.getFullYear()) return null
  
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthProgress = (now.getDate() / daysInMonth) * 100
  
  if (percentage > monthProgress + 15) return { label: 'Rythme élevé', class: 'text-red-500 bg-red-50 border-red-100' }
  if (percentage < monthProgress - 10) return { label: 'Économe', class: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
  return { label: 'Dans les temps', class: 'text-blue-600 bg-blue-50 border-blue-100' }
}