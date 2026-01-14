<script setup lang="ts">
const model = defineModel<boolean>()

defineProps<{
  label?: string
  description?: string
}>()
</script>

<template>
  <button 
    type="button"
    role="switch"
    :aria-checked="model"
    class="flex items-center justify-between gap-3 cursor-pointer group w-full focus:outline-none" 
    @click="model = !model"
  >
    <div class="text-left">
      <span v-if="label" class="text-xs font-medium text-ui-content-muted group-hover:text-ui-content transition-colors block">{{ label }}</span>
      <span v-if="description" class="text-[10px] text-ui-content-muted/70 block mt-0.5 font-normal">{{ description }}</span>
    </div>
    <div 
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
      :class="model ? 'bg-blue-600' : 'bg-ui-border'"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        :class="model ? 'translate-x-4' : 'translate-x-0'"
      />
    </div>
  </button>
</template>