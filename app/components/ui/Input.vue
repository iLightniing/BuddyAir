<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const model = defineModel<string | number>()

const props = defineProps<{
  label: string
  type?: string
  placeholder?: string
  disabled?: boolean
  id?: string
}>()

const generatedId = useId()
const inputId = computed(() => props.id || generatedId)
</script>

<template>
  <div class="space-y-2">
    <label :for="inputId" class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">{{ label }}</label>
    <div class="relative">
      <input
        v-bind="$attrs"
        :id="inputId"
        v-model="model"
        :type="type || 'text'"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full h-[52px] px-5 bg-ui-surface border border-slate-400 rounded-md text-ui-content placeholder:text-ui-content-muted/50 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all text-sm bg-no-repeat"
        :class="[disabled ? 'opacity-60 cursor-not-allowed bg-ui-surface-muted pr-10' : '']"
      />
      <Icon v-if="disabled" name="lucide:lock" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted pointer-events-none" />
    </div>
  </div>
</template>