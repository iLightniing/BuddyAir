import { getDaysInMonth, formatInputDate, parseInputDate } from '~/utils/date'

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
    return getDaysInMonth(year, month)
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
    const val = (e.target as HTMLInputElement).value
    const formatted = formatInputDate(val)
    displayValue.value = formatted
    
    // Si la date est complète (10 chars), on essaie de mettre à jour le modèle
    const parsed = parseInputDate(formatted)
    if (parsed) {
        model.value = parsed
        navigationDate.value = new Date(parsed)
    } else if (formatted === '') {
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