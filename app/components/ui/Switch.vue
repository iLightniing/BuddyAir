<script setup lang="ts">
const model = defineModel<boolean>()

defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 cursor-pointer group" @click="model = !model">
    <span v-if="label" class="text-xs font-medium text-ui-content-muted group-hover:text-ui-content transition-colors">{{ label }}</span>
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
  </div>
</template>