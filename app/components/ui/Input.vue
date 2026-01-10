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
    <label :for="id" class="text-[10px] font-black text-white uppercase tracking-[0.2em] ml-1 opacity-90">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      class="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/20 transition-all text-sm"
    />
  </div>
</template>