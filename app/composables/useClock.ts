import { ref, onMounted, onUnmounted } from 'vue'

export const useClock = () => {
  const currentTime = ref('')
  const currentDate = ref('')
  const isShuffling = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const updateDateTime = () => {
    if (isShuffling.value) return
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    currentDate.value = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const shuffleTime = () => {
    if (isShuffling.value) return
    isShuffling.value = true
    let iterations = 0
    const interval = setInterval(() => {
      const randomH = Math.floor(Math.random() * 24).toString().padStart(2, '0')
      const randomM = Math.floor(Math.random() * 60).toString().padStart(2, '0')
      currentTime.value = `${randomH}:${randomM}`
      iterations++
      if (iterations > 10) {
        clearInterval(interval)
        isShuffling.value = false
        updateDateTime()
      }
    }, 40)
  }

  onMounted(() => {
    updateDateTime()
    timer = setInterval(updateDateTime, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    currentTime,
    currentDate,
    shuffleTime
  }
}