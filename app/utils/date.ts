export const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1)
  const days = []
  
  // Lundi = 0, Dimanche = 6 (Ajustement du getDay() qui renvoie Dimanche=0)
  let firstDayIndex = date.getDay() - 1
  if (firstDayIndex === -1) firstDayIndex = 6
  
  for (let i = 0; i < firstDayIndex; i++) days.push(null)
  
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

export const formatInputDate = (val: string) => {
    let value = val.replace(/\D/g, '') // Garder que les chiffres
    if (value.length > 8) value = value.slice(0, 8)
    
    // Masque automatique : JJ/MM/AAAA
    if (value.length >= 5) {
      return value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4)
    } else if (value.length >= 3) {
      return value.slice(0, 2) + '/' + value.slice(2)
    }
    return value
}

export const parseInputDate = (val: string): string | null => {
    if (val.length === 10) {
      const [day = 0, month = 0, year = 0] = val.split('/').map(Number)
      const date = new Date(year, (month || 1) - 1, day || 1)
      // Vérification de validité (ex: pas de 32/01)
      if (date.getFullYear() === year && date.getMonth() === (month || 1) - 1 && date.getDate() === day) {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }
    }
    return null
}