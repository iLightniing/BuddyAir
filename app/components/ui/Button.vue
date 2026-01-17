<script setup lang="ts">
import { NuxtLink } from '#components'

interface Props {
  to?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  disabled?: boolean
  loading?: boolean
}
withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  loading: false
})
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="disabled || loading"
    class="group relative overflow-hidden inline-flex items-center justify-center font-bold rounded-md transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    :class="[
      { 'px-8 py-3.5 bg-ui-content text-ui-surface hover:opacity-90 shadow-sm border border-transparent': variant === 'primary' },
      { 'px-8 py-3.5 bg-ui-surface-muted text-ui-content border border-ui-border hover:bg-ui-border/50 shadow-none': variant === 'secondary' },
      { 'px-4 py-2 bg-transparent text-ui-content hover:bg-ui-surface-muted border-transparent shadow-none': variant === 'ghost' },
      { 'px-8 py-3.5 bg-transparent text-ui-content border border-ui-border hover:bg-ui-surface-muted shadow-none': variant === 'outline' }
    ]"
  >
    <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none transition-opacity duration-300"></div>
    <span class="relative z-10 flex items-center gap-2">
      <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
      <slot />
    </span>
  </component>
</template>