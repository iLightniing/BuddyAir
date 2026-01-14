export const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4']

export const generateConicGradient = (data: { color: string, percentage: number }[]) => {
  let currentAngle = 0
  const segments = data.map(item => {
    const start = currentAngle
    const end = currentAngle + item.percentage
    currentAngle = end
    return `${item.color} ${start}% ${end}%`
  })
  if (segments.length === 0) return 'conic-gradient(#f1f5f9 0% 100%)'
  return `conic-gradient(${segments.join(', ')})`
}