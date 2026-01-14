export const useDatePicker = (
  model: Ref<string | undefined>,
  containerRef: Ref<HTMLElement | null>,
  inputRef: Ref<HTMLInputElement | null>
) => {
  const isOpen = ref(false)
  const navigationDate = ref(new Date())
  const displayValue = ref('')
  const view = ref<'days' | 'months' | 'years'>('days')

  // Initialisation et synchronisation (Modèle -> Affichage)
  watch(model, (val) => {
    if (val) {
      // On gère le format YYYY-MM-DD ou ISO
      const datePart = val.split(/[T ]/)[0] ?? ''
      const [y = 0, m = 0, d = 0] = datePart.split('-').map(Number)
      navigationDate.value = new Date(y, (m || 1) - 1, d || 1)
      
      // On ne met à jour l'affichage que si l'utilisateur n'est pas en train de taper
      if (typeof document !== 'undefined' && document.activeElement !== inputRef.value) {
        displayValue.value = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
      }
    } else if (typeof document !== 'undefined' && document.activeElement !== inputRef.value) {
      displayValue.value = ''
    }
  }, { immediate: true })

  const yearsList = computed(() => {
    const currentYear = navigationDate.value.getFullYear()
    const start = Math.floor(currentYear / 12) * 12
    return Array.from({ length: 12 }, (_, i) => start + i)
  })

  const monthsList = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const headerLabel = computed(() => {
    if (view.value === 'days') return navigationDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    if (view.value === 'months') return navigationDate.value.getFullYear().toString()
    const currentYear = navigationDate.value.getFullYear()
    const start = Math.floor(currentYear / 12) * 12
    return `${start} - ${start + 11}`
  })

  const daysInMonth = computed(() => {
    const year = navigationDate.value.getFullYear()
    const month = navigationDate.value.getMonth()
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
  })

  const handlePrev = () => {
    if (view.value === 'days') navigationDate.value = new Date(navigationDate.value.getFullYear(), navigationDate.value.getMonth() - 1, 1)
    else if (view.value === 'months') navigationDate.value = new Date(navigationDate.value.getFullYear() - 1, navigationDate.value.getMonth(), 1)
    else navigationDate.value = new Date(navigationDate.value.getFullYear() - 12, navigationDate.value.getMonth(), 1)
  }

  const handleNext = () => {
    if (view.value === 'days') navigationDate.value = new Date(navigationDate.value.getFullYear(), navigationDate.value.getMonth() + 1, 1)
    else if (view.value === 'months') navigationDate.value = new Date(navigationDate.value.getFullYear() + 1, navigationDate.value.getMonth(), 1)
    else navigationDate.value = new Date(navigationDate.value.getFullYear() + 12, navigationDate.value.getMonth(), 1)
  }

  const selectYear = (year: number) => {
    navigationDate.value = new Date(year, navigationDate.value.getMonth(), 1)
    view.value = 'months'
  }

  const selectMonth = (index: number) => {
    navigationDate.value = new Date(navigationDate.value.getFullYear(), index, 1)
    view.value = 'days'
  }

  const selectDate = (date: Date) => {
    // Format YYYY-MM-DD sans décalage horaire (on utilise les composants locaux)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    model.value = `${year}-${month}-${day}`
    isOpen.value = false
  }

  // Gestion de la saisie manuelle (Affichage -> Modèle)
  const handleInput = (e: Event) => {
    let val = (e.target as HTMLInputElement).value.replace(/\D/g, '') // Garder que les chiffres
    if (val.length > 8) val = val.slice(0, 8)
    
    // Masque automatique : JJ/MM/AAAA
    if (val.length >= 5) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4)
    } else if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    
    displayValue.value = val
    
    // Si la date est complète (10 chars), on essaie de mettre à jour le modèle
    if (val.length === 10) {
      const [day = 0, month = 0, year = 0] = val.split('/').map(Number)
      const date = new Date(year, (month || 1) - 1, day || 1)
      // Vérification de validité (ex: pas de 32/01)
      if (date.getFullYear() === year && date.getMonth() === (month || 1) - 1 && date.getDate() === day) {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        model.value = `${y}-${m}-${d}`
        navigationDate.value = date
      }
    } else if (val === '') {
      model.value = ''
    }
  }

  const isSelected = (date: Date) => model.value && new Date(model.value).toDateString() === date.toDateString()
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) isOpen.value = false
  }

  watch(isOpen, (val) => {
    if (val) view.value = 'days'
  })

  onMounted(() => document.addEventListener('click', handleClickOutside))
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))

  return {
    isOpen, displayValue, view, yearsList, monthsList, headerLabel, daysInMonth, navigationDate,
    handlePrev, handleNext, selectYear, selectMonth, selectDate, handleInput, isSelected, isToday
  }
}