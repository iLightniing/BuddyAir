<script setup lang="ts">
defineProps<{
  title: string
  icon: string
}>()
</script>

<template>
  <div class="bg-ui-surface border border-ui-border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px] transition-colors hover:bg-ui-surface-muted/30">
    <div class="w-12 h-12 bg-ui-surface-muted rounded-full flex items-center justify-center mb-3">
      <Icon :name="icon" class="w-6 h-6 text-ui-content-muted" />
    </div>
    <h3 class="font-bold text-ui-content">{{ title }}</h3>
    <p class="text-xs text-ui-content-muted mt-1">Ce widget est en cours de développement.</p>
  </div>
</template>