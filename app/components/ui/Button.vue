<script setup lang="ts">
interface Props {
  to?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
}
withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

// On résout explicitement le composant NuxtLink pour garantir son bon fonctionnement dans :is
const NuxtLink = resolveComponent('NuxtLink')
</script>
<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="!to ? type || 'button' : undefined"
    class="group relative overflow-hidden inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
    :class="[
      variant === 'primary' ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 shadow-sm border border-transparent dark:border-white/10' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-none'
    ]"
  >
    <!-- Shimmer Effect Layer -->
    <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none transition-opacity duration-300"></div>
    
    <span class="relative z-10 flex items-center gap-2">
      <slot />
    </span>
  </component>
</template>