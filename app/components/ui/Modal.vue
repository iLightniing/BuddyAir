<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-8"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-8"
    >
      <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-500/5 backdrop-blur-[2px]">
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>