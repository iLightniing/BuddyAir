export const getNextOccurrences = (startDateStr: string | undefined, frequency: string, dayOfMonth: number, shiftWeekends: boolean, count: number = 3) => {
  if (!startDateStr) return []
  
  const dates: Date[] = []
  // On part de la date de début
  let base = new Date(startDateStr)
  
  // Si le jour de départ est après le jour demandé, on passe au mois suivant pour la première occurrence
  // Sauf si on est exactement le jour même
  if (base.getDate() > dayOfMonth) {
    base.setMonth(base.getMonth() + 1)
  }
  // On fixe le jour
  base.setDate(dayOfMonth)

  const monthsToAdd = {
    'monthly': 1, 'bimonthly': 2, 'quarterly': 3, 'semiannual': 6, 'yearly': 12
  }[frequency] || 1

  for (let i = 0; i < count; i++) {
    let d = new Date(base)
    d.setMonth(base.getMonth() + (monthsToAdd * i))
    
    if (shiftWeekends) {
      const day = d.getDay()
      if (day === 6) d.setDate(d.getDate() + 2) // Samedi -> Lundi
      else if (day === 0) d.setDate(d.getDate() + 1) // Dimanche -> Lundi
    }
    dates.push(d)
  }
  return dates
}