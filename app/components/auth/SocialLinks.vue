<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="mt-10">
    <div class="relative flex items-center mb-4">
      <div class="flex-grow border-t border-white/5"></div>
      <span class="mx-4 text-xs font-bold text-white uppercase tracking-[0.2em]">{{ label }}</span>
      <div class="flex-grow border-t border-white/5"></div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <button type="button" class="flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:border-white/20 transition-all text-white text-sm font-bold cursor-pointer group/btn">
        <Icon name="logos:google-icon" class="w-5 h-5" /> Google
      </button>
      <button type="button" class="flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:border-white/20 transition-all text-white text-sm font-bold cursor-pointer group/btn">
        <Icon name="logos:facebook" class="w-5 h-5" /> Facebook
      </button>
    </div>
  </div>
</template>