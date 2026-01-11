<script setup lang="ts">
const model = defineModel<string | number>()

defineProps<{
  label: string
  options: { label: string, value: string | number, activeClass?: string }[]
}>()
</script>

<template>
  <div class="space-y-2">
    <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">{{ label }}</label>
    <div class="flex bg-ui-surface-muted p-1 rounded-md border border-ui-border h-[52px]">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        @click="model = opt.value"
        class="flex-1 flex items-center justify-center text-xs font-bold rounded-md transition-all duration-300 cursor-pointer"
        :class="[
          model === opt.value 
            ? (opt.activeClass || 'bg-ui-surface shadow-sm text-blue-500') 
            : 'text-ui-content-muted hover:text-ui-content'
        ]"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
button {
  outline: none !important;
}
</style>