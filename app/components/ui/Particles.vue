<script setup lang="ts">
import { useParticles } from '~/composables/useParticles'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  effect: 'snow' | 'petals'
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isMounted = ref(false)
const { initParticles, draw, cancelAnimation } = useParticles(canvasRef, toRef(props, 'effect'))

const handleResize = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    initParticles(window.innerWidth, window.innerHeight)
  }
}

onMounted(() => {
  isMounted.value = true
  nextTick(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    draw()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimation()
})

watch(() => props.effect, () => {
  if (canvasRef.value) initParticles(canvasRef.value.width, canvasRef.value.height)
})
</script>

<template>
  <canvas v-if="isMounted" v-bind="$attrs" ref="canvasRef" class="fixed inset-0 pointer-events-none"></canvas>
</template>