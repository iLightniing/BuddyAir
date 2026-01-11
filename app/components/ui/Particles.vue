<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  effect: 'snow' | 'petals'
}>()

interface ParticleConfig {
  colors: string[]
  speedY: [number, number]
  speedX: [number, number]
  size: [number, number]
  isPetal: boolean
}

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  rotation: number
  rotationSpeed: number
  color: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isMounted = ref(false)
let animationFrame: number
let particles: Particle[] = []

const getConfig = (): ParticleConfig => {
  if (props.effect === 'petals') {
    return {
      colors: ['255, 183, 178', '255, 209, 220', '255, 255, 255'],
      speedY: [0.5, 1.5],
      speedX: [-1, 1],
      size: [4, 8],
      isPetal: true
    }
  }
  return {
    colors: ['255, 255, 255'],
    speedY: [0.5, 2],
    speedX: [-0.5, 0.5],
    size: [1, 4],
    isPetal: false
  }
}

const initParticles = (width: number, height: number) => {
  const config = getConfig()
  particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * (config.size[1] - config.size[0]) + config.size[0],
    speedY: Math.random() * (config.speedY[1] - config.speedY[0]) + config.speedY[0],
    speedX: Math.random() * (config.speedX[1] - config.speedX[0]) + config.speedX[0],
    opacity: Math.random() * 0.5 + 0.3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
    color: config.colors[Math.floor(Math.random() * config.colors.length)] ?? '255, 255, 255'
  }))
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach(p => {
    ctx.beginPath()
    ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`
    
    if (props.effect === 'petals') {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation * Math.PI / 180)
      ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.restore()
      p.rotation += p.rotationSpeed
    } else {
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    p.y += p.speedY
    p.x += p.speedX

    if (p.y > canvas.height) {
      p.y = -20
      p.x = Math.random() * canvas.width
    }
    if (p.x > canvas.width) p.x = 0
    if (p.x < 0) p.x = canvas.width
  })

  animationFrame = requestAnimationFrame(draw)
}

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
  cancelAnimationFrame(animationFrame)
})

watch(() => props.effect, () => {
  if (canvasRef.value) initParticles(canvasRef.value.width, canvasRef.value.height)
})
</script>

<template>
  <canvas v-if="isMounted" v-bind="$attrs" ref="canvasRef" class="fixed inset-0 pointer-events-none"></canvas>
</template>