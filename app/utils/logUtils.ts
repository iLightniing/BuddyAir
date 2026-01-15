export const getLogLevelConfig = (level: string) => {
  switch(level) {
    case 'error': return { icon: 'lucide:alert-circle', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    case 'warn': return { icon: 'lucide:alert-triangle', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    case 'info': return { icon: 'lucide:info', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    case 'debug': return { icon: 'lucide:bug', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
    default: return { icon: 'lucide:help-circle', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
  }
}

export const exportLogsToCsv = (logs: any[]) => {
  const headers = ['ID', 'Date', 'Niveau', 'Message', 'Utilisateur', 'Contexte', 'User Agent']
  const csvContent = [
    headers.join(','),
    ...logs.map(log => [
      log.id,
      new Date(log.created).toISOString(),
      log.level,
      `"${(log.message || '').replace(/"/g, '""')}"`,
      log.expand?.user?.email || 'Anonyme',
      `"${(log.context || '').replace(/"/g, '""')}"`,
      `"${(log.user_agent || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `logs_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}