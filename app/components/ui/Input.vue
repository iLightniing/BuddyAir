<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const model = defineModel<string>()
const id = useId()

defineProps<{
  label: string
  type?: string
  placeholder?: string
}>()
</script>

<template>
  <div class="space-y-2">
    <label :for="id" class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      class="w-full px-5 py-3.5 bg-ui-surface border border-ui-border rounded-xl text-ui-content placeholder:text-ui-content-muted/50 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all text-sm"
    />
  </div>
</template>