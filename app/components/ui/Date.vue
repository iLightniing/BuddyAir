<script setup lang="ts">
import { useDatePicker } from '~/composables/useDatePicker'
import { useTimeManagement } from '~/composables/useTimeManagement'

const model = defineModel<string>()

const props = defineProps<{
  label?: string
  required?: boolean
  disabled?: boolean
  enableTime?: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const {
  isOpen,
  displayValue,
  view,
  yearsList,
  monthsList,
  headerLabel,
  daysInMonth,
  navigationDate,
  handlePrev,
  handleNext,
  selectYear,
  selectMonth,
  selectDate,
  handleInput,
  isSelected,
  isToday,
  setTime
} = useDatePicker(model, containerRef, inputRef, { enableTime: props.enableTime })

const { hours, minutes, updateTime, adjustTime } = useTimeManagement(model, setTime)
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
        :placeholder="enableTime ? 'JJ/MM/AAAA HH:MM' : 'JJ/MM/AAAA'"
        :disabled="disabled"
        class="w-full bg-ui-surface border border-slate-400 rounded-md pl-10 pr-8 py-2 text-sm font-bold text-ui-content transition-all h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-ui-content-muted/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-ui-surface-muted"
        @focus="!disabled && (isOpen = true)"
      />
      <Icon v-if="disabled" name="lucide:lock" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted pointer-events-none" />
      
      <button 
        v-else
        type="button"
        @click="isOpen = !isOpen"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-ui-content-muted hover:text-blue-500 transition-colors"
      >
        <Icon :name="enableTime ? 'lucide:clock' : 'lucide:calendar'" class="w-4 h-4" />
      </button>
      
      <!-- Bouton Effacer -->
      <button type="button" v-if="model && !required && !disabled" @click.stop="model = ''; displayValue = ''" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ui-content-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title="Effacer la date">
        <Icon name="lucide:x" class="w-3.5 h-3.5" />
      </button>
      
      <!-- Dropdown Calendrier -->
      <div v-if="isOpen" class="absolute top-full left-0 mt-2 w-64 bg-ui-surface border border-ui-border rounded-xl shadow-2xl z-50 p-3 animate-in zoom-in-95 duration-200">
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

        <!-- Sélecteur d'heure -->
        <div v-if="enableTime" class="mt-3 pt-3 border-t border-ui-border">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-ui-content-muted uppercase tracking-wider">Heure</span>
                <div class="flex items-center gap-2">
                    <!-- Heures -->
                    <div class="flex flex-col items-center gap-1">
                        <button type="button" @click.stop="adjustTime('hours', 1)" class="text-ui-content-muted hover:text-blue-600 p-0.5"><Icon name="lucide:chevron-up" class="w-3 h-3" /></button>
                        <input 
                            type="text" 
                            v-model="hours" 
                            @change="updateTime"
                            class="w-12 text-center bg-slate-100 border border-slate-200 rounded-md text-lg font-black text-ui-content focus:outline-none focus:border-blue-500 focus:bg-white transition-colors py-1"
                            placeholder="HH"
                        />
                        <button type="button" @click.stop="adjustTime('hours', -1)" class="text-ui-content-muted hover:text-blue-600 p-0.5"><Icon name="lucide:chevron-down" class="w-3 h-3" /></button>
                    </div>
                    
                    <span class="text-ui-content-muted font-bold">:</span>
                    
                    <!-- Minutes -->
                    <div class="flex flex-col items-center gap-1">
                        <button type="button" @click.stop="adjustTime('minutes', 1)" class="text-ui-content-muted hover:text-blue-600 p-0.5"><Icon name="lucide:chevron-up" class="w-3 h-3" /></button>
                        <input 
                            type="text" 
                            v-model="minutes" 
                            @change="updateTime"
                            class="w-12 text-center bg-slate-100 border border-slate-200 rounded-md text-lg font-black text-ui-content focus:outline-none focus:border-blue-500 focus:bg-white transition-colors py-1"
                            placeholder="MM"
                        />
                        <button type="button" @click.stop="adjustTime('minutes', -1)" class="text-ui-content-muted hover:text-blue-600 p-0.5"><Icon name="lucide:chevron-down" class="w-3 h-3" /></button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>