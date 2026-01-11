<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-md p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-ui-content-muted text-[10px] font-black uppercase tracking-[0.2em]">{{ title }}</h3>
      <div v-if="icon" class="w-8 h-8 flex items-center justify-center rounded-lg bg-ui-surface-muted text-blue-500 group-hover:scale-110 transition-transform">
        <Icon :name="icon" class="w-4 h-4" />
      </div>
    </div>
    <slot />
  </div>
</template>