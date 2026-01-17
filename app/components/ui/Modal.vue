<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  show: boolean
  title?: string
}>()

const emit = defineEmits(['close'])

// Fermer la modale avec la touche "Echap"
const onKeydown = (e: KeyboardEvent) => {
  if (props.show && e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    > 
      <!-- PERFORMANCE: Retrait de backdrop-blur-sm pour fluidifier l'animation -->
      <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50" @click.self="emit('close')">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div @click.stop class="w-full flex justify-center max-h-full sm:max-h-[90vh]">
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>