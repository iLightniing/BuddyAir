<script setup lang="ts">

defineOptions({ inheritAttrs: false })
const model = defineModel<string | number>()
const id = useId()

const props = defineProps<{
  label?: string
  options: { label: string, value: string | number }[]
  disabled?: boolean
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggle = () => !props.disabled && (isOpen.value = !isOpen.value)
const close = () => isOpen.value = false

const selectOption = (val: string | number) => {
  model.value = val
  close()
}

const selectedLabel = computed(() => {
  return props.options.find(opt => opt.value === model.value)?.label || 'Sélectionner...'
})

// Fermer au clic à l'extérieur
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="space-y-2" ref="containerRef">
    <label v-if="label" :for="id" class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">{{ label }}</label>
    
    <div class="relative">
      <!-- Déclencheur (Trigger) -->
      <button
        type="button"
        @click="toggle"
        class="w-full px-5 py-2.5 bg-ui-surface border border-slate-400 rounded-md text-ui-content text-left flex items-center justify-between focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all text-sm shadow-xs h-[52px]"
        :class="disabled ? 'opacity-60 cursor-not-allowed bg-ui-surface-muted' : 'hover:border-blue-400/50 cursor-pointer'"
      >
        <span :class="{ 'text-ui-content-muted/50': !model }">{{ selectedLabel }}</span>
        <Icon 
          :name="disabled ? 'lucide:lock' : 'lucide:chevron-down'" 
          class="w-4 h-4 text-ui-content-muted transition-transform duration-300"
          :class="{ 'rotate-180': isOpen && !disabled }"
        />
      </button>

      <!-- Panneau des options -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-2"
      >
        <div v-if="isOpen" class="absolute z-50 w-full mt-2 bg-ui-surface border border-ui-border rounded-md shadow-xl overflow-hidden py-1 backdrop-blur-xl">
          <div class="max-h-60 overflow-y-auto scrollbar-hide">
            <button
              v-for="opt in options"
              :key="opt.value"
              type="button"
              @click="selectOption(opt.value)"
              class="w-full px-5 py-2.5 text-sm text-left transition-colors flex items-center justify-between group"
              :class="[model === opt.value ? 'bg-blue-500/10 text-blue-600 font-bold' : 'text-ui-content hover:bg-ui-surface-muted']"
            >
              {{ opt.label }}
              <Icon v-if="model === opt.value" name="lucide:check" class="w-4 h-4 text-blue-500" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>