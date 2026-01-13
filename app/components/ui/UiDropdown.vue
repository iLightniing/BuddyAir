<script setup lang="ts">
const props = defineProps<{
  modelValue: any
  options: { label: string, value: any }[]
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  return props.options.find(o => o.value === props.modelValue)?.label
})

const selectOption = (value: any) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <button @click="isOpen = !isOpen" class="w-full h-10 px-3 flex items-center justify-between bg-ui-surface border border-ui-border hover:border-ui-content-muted rounded-xl text-xs font-bold text-ui-content transition-colors">
      <span class="truncate">{{ selectedLabel }}</span>
      <Icon name="lucide:chevron-down" class="w-4 h-4 text-ui-content-muted" />
    </button>
    <div v-if="isOpen" class="absolute top-full left-0 mt-1 w-full bg-ui-surface border border-ui-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div class="p-1">
        <button v-for="opt in options" :key="opt.value" @click="selectOption(opt.value)" class="w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-ui-surface-muted transition-colors" :class="modelValue === opt.value ? 'text-blue-600 bg-blue-50' : 'text-ui-content'">{{ opt.label }}</button>
      </div>
    </div>
  </div>
</template>