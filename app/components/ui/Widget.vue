<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <div class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300 group">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">{{ title }}</h3>
      <div v-if="icon" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-blue-400 group-hover:scale-110 transition-transform">
        <Icon :name="icon" class="w-4 h-4" />
      </div>
    </div>
    <slot />
  </div>
</template>