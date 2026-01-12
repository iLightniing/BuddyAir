<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  message?: string
}>()
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-md p-6 md:p-12 text-center">
    <Icon :name="icon" class="w-12 h-12 mx-auto mb-4 text-ui-content-muted/20" />
    <h2 class="text-xl font-black text-ui-content">{{ title }}</h2>
    <p class="text-ui-content-muted italic">{{ message || 'Bientôt disponible...' }}</p>
  </div>
</template>