<script setup lang="ts">
const model = defineModel<string>()

const props = defineProps<{
  label?: string
  required?: boolean
  disabled?: boolean
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
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
    if (document.activeElement !== inputRef.value) {
      displayValue.value = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
    }
  } else if (document.activeElement !== inputRef.value) {
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
</script>

<template>
  <div class="space-y-2" ref="containerRef">
    <label v-if="label" class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative group">
      <input 
        ref="inputRef"
        type="text"
        v-model="displayValue"
        @input="handleInput"
        placeholder="JJ/MM/AAAA"
        :disabled="disabled"
        class="w-full bg-ui-surface border border-slate-400 rounded-md pl-10 pr-8 py-2 text-sm font-bold text-ui-content transition-all h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-ui-content-muted/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-ui-surface-muted"
      />
      <Icon v-if="disabled" name="lucide:lock" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted pointer-events-none" />
      
      <button 
        v-else
        type="button"
        @click="isOpen = !isOpen"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-ui-content-muted hover:text-blue-500 transition-colors"
      >
        <Icon name="lucide:calendar" class="w-4 h-4" />
      </button>
      
      <!-- Bouton Effacer -->
      <button type="button" v-if="model && !required && !disabled" @click.stop="model = ''; displayValue = ''" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ui-content-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title="Effacer la date">
        <Icon name="lucide:x" class="w-3.5 h-3.5" />
      </button>
      
      <!-- Dropdown Calendrier -->
      <div v-if="isOpen" class="absolute top-full left-0 mt-2 w-64 bg-ui-surface border border-ui-border rounded-xl shadow-2xl z-50 p-3">
        <div class="flex items-center justify-between mb-2">
          <button type="button" @click.stop="handlePrev" class="p-1 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-ui-content"><Icon name="lucide:chevron-left" class="w-5 h-5" /></button>
          
          <button 
            type="button"
            @click.stop="view === 'days' ? (view = 'months') : (view === 'months' ? (view = 'years') : (view = 'days'))" 
            class="text-sm font-black text-ui-content capitalize hover:text-blue-500 transition-colors"
          >
            {{ headerLabel }}
          </button>
          
          <button type="button" @click.stop="handleNext" class="p-1 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-ui-content"><Icon name="lucide:chevron-right" class="w-5 h-5" /></button>
        </div>
        
        <!-- Vue Jours -->
        <div v-if="view === 'days'">
          <div class="grid grid-cols-7 mb-2">
            <span v-for="day in ['L', 'M', 'M', 'J', 'V', 'S', 'D']" :key="day" class="text-center text-[10px] font-bold text-ui-content-muted">{{ day }}</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <template v-for="(date, index) in daysInMonth" :key="index">
              <div v-if="!date" class="h-7"></div>
              <button type="button" v-else @click.stop="selectDate(date)" class="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold transition-all" :class="[isSelected(date) ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-ui-surface-muted text-ui-content', isToday(date) && !isSelected(date) ? 'text-blue-500 bg-blue-50' : '']">{{ date.getDate() }}</button>
            </template>
          </div>
        </div>

        <!-- Vue Mois -->
        <div v-else-if="view === 'months'" class="grid grid-cols-3 gap-2">
          <button type="button" v-for="(m, i) in monthsList" :key="m" @click.stop="selectMonth(i)" class="p-2 rounded-md text-xs font-bold hover:bg-ui-surface-muted text-ui-content" :class="i === navigationDate.getMonth() ? 'bg-blue-50 text-blue-600' : ''">{{ m.substring(0, 3) }}</button>
        </div>

        <!-- Vue Années -->
        <div v-else-if="view === 'years'" class="grid grid-cols-3 gap-2">
          <button type="button" v-for="y in yearsList" :key="y" @click.stop="selectYear(y)" class="p-2 rounded-md text-xs font-bold hover:bg-ui-surface-muted text-ui-content" :class="y === navigationDate.getFullYear() ? 'bg-blue-50 text-blue-600' : ''">{{ y }}</button>
        </div>
      </div>
    </div>
  </div>
</template>