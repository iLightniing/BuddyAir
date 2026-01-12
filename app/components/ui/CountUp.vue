<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  currency?: string
  duration?: number
}>(), {
  duration: 800 // Durée de l'animation en ms
})

const displayedValue = ref(props.value)
let animationFrame: number

const animate = (start: number, end: number) => {
  const startTime = performance.now()
  const change = end - start
  
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    
    // Fonction de lissage (Ease Out Quart) pour un effet naturel
    const ease = 1 - Math.pow(1 - progress, 4)
    
    displayedValue.value = start + (change * ease)
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(update)
    } else {
      displayedValue.value = end
    }
  }
  
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(update)
}

watch(() => props.value, (newVal, oldVal) => {
  animate(oldVal ?? 0, newVal)
})

const formatted = computed(() => displayedValue.value.toLocaleString('fr-FR', { style: 'currency', currency: props.currency || 'EUR' }))
</script>

<template>
  <span>{{ formatted }}</span>
</template>