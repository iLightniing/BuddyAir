<script setup lang="ts">
const { message, type, isVisible } = useNotification()
</script>

<template>
  <Transition
    enter-active-class="transform transition duration-300 ease-out"
    enter-from-class="-translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isVisible" class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <div 
        class="backdrop-blur-xl border px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
        :class="[
          type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-100' : 'bg-white/10 border-white/20 text-white'
        ]"
      >
        <Icon :name="type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-6 h-6 shrink-0" />
        <p class="text-sm font-medium">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>