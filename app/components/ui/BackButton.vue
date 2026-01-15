<script setup lang="ts">
defineProps<{
  to?: string
  label?: string
}>()

const router = useRouter()
</script>

<template>
  <NuxtLink 
    v-if="to"
    :to="to"
    class="group flex items-center gap-3 text-ui-content-muted hover:text-ui-content transition-colors focus:outline-none"
  >
    <div class="w-10 h-10 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
      <Icon name="lucide:arrow-left" class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    </div>
    <span v-if="label" class="text-sm font-bold">{{ label }}</span>
  </NuxtLink>
  <button 
    v-else
    @click="router.back()"
    class="group flex items-center gap-3 text-ui-content-muted hover:text-ui-content transition-colors focus:outline-none"
  >
    <div class="w-10 h-10 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
      <Icon name="lucide:arrow-left" class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    </div>
    <span v-if="label" class="text-sm font-bold">{{ label }}</span>
  </button>
</template>