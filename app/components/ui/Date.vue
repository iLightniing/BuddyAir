<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  label?: string
  required?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const navigationDate = ref(new Date())

// Initialisation de la date de navigation
watch(() => props.modelValue, (val) => {
  if (val) {
    navigationDate.value = new Date(val)
  }
}, { immediate: true })

const formattedValue = computed(() => {
  if (!props.modelValue) return ''
  return new Date(props.modelValue).toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
})

const currentMonthLabel = computed(() => {
  return navigationDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
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

const prevMonth = () => navigationDate.value = new Date(navigationDate.value.getFullYear(), navigationDate.value.getMonth() - 1, 1)
const nextMonth = () => navigationDate.value = new Date(navigationDate.value.getFullYear(), navigationDate.value.getMonth() + 1, 1)

const selectDate = (date: Date) => {
  // Format YYYY-MM-DD sans décalage horaire (on utilise les composants locaux)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  emit('update:modelValue', `${year}-${month}-${day}`)
  isOpen.value = false
}

const isSelected = (date: Date) => props.modelValue && new Date(props.modelValue).toDateString() === date.toDateString()
const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) isOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="flex flex-col gap-1.5" ref="containerRef">
    <label v-if="label" class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative group">
      <div 
        @click="isOpen = !isOpen"
        class="w-full bg-ui-surface hover:bg-ui-surface-muted border-2 border-ui-border rounded-md pl-10 pr-8 py-2.5 text-sm font-bold text-ui-content transition-all cursor-pointer flex items-center min-h-[44px]"
        :class="isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''"
      >
        <span v-if="formattedValue">{{ formattedValue }}</span>
        <span v-else class="text-ui-content-muted font-normal">Sélectionner...</span>
      </div>
      <Icon name="lucide:calendar" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted pointer-events-none" />
      
      <!-- Bouton Effacer -->
      <button v-if="modelValue && !required" @click.stop="$emit('update:modelValue', '')" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ui-content-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title="Effacer la date">
        <Icon name="lucide:x" class="w-3.5 h-3.5" />
      </button>
      
      <!-- Dropdown Calendrier -->
      <div v-if="isOpen" class="absolute top-full left-0 mt-2 w-64 bg-ui-surface border border-ui-border rounded-xl shadow-2xl z-50 p-3">
        <div class="flex items-center justify-between mb-2">
          <button @click.stop="prevMonth" class="p-1 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-ui-content"><Icon name="lucide:chevron-left" class="w-5 h-5" /></button>
          <span class="text-sm font-black text-ui-content capitalize">{{ currentMonthLabel }}</span>
          <button @click.stop="nextMonth" class="p-1 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-ui-content"><Icon name="lucide:chevron-right" class="w-5 h-5" /></button>
        </div>
        <div class="grid grid-cols-7 mb-2">
          <span v-for="day in ['L', 'M', 'M', 'J', 'V', 'S', 'D']" :key="day" class="text-center text-[10px] font-bold text-ui-content-muted">{{ day }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <template v-for="(date, index) in daysInMonth" :key="index">
            <div v-if="!date" class="h-7"></div>
            <button v-else @click.stop="selectDate(date)" class="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold transition-all" :class="[isSelected(date) ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-ui-surface-muted text-ui-content', isToday(date) && !isSelected(date) ? 'text-blue-500 bg-blue-50' : '']">{{ date.getDate() }}</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>