<script setup lang="ts">
const model = defineModel<boolean>()

defineProps<{
  label?: string
}>()
</script>

<template>
  <label class="flex items-center gap-2 cursor-pointer group justify-center">
    <div class="relative flex items-center">
      <input 
        type="checkbox" 
        v-model="model"
        class="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-ui-surface checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer hover:border-blue-400" 
      />
      <Icon 
        name="lucide:check" 
        class="absolute inset-0 m-auto w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-[3]" 
      />
    </div>
    <span v-if="label" class="text-sm text-ui-content">{{ label }}</span>
  </label>
</template>
