<script setup lang="ts">
import { NuxtLink } from '#components'

interface Props {
  to?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}
withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button'
})
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="!to ? disabled : undefined"
    class="group relative overflow-hidden inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
    :class="[
      variant === 'primary' ? 'bg-ui-content text-ui-surface hover:opacity-90 shadow-sm border border-transparent' : 'bg-ui-surface-muted text-ui-content border border-ui-border hover:bg-ui-border/50 shadow-none',
      { 'disabled:opacity-50 disabled:cursor-not-allowed': !to }
    ]"
  >
    <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none transition-opacity duration-300"></div>
    <span class="relative z-10 flex items-center gap-2"><slot /></span>
  </component>
</template>