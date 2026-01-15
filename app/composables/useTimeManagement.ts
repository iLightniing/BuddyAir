import { ref, watch, type Ref } from 'vue'

export const useTimeManagement = (model: Ref<string | undefined>, setTime: (h: number, m: number) => void) => {
  const hours = ref('00')
  const minutes = ref('00')

  watch(model, (val) => {
      if (val && val.includes('T')) {
          const time = val.split('T')[1]
          if (time) {
              const [h, m] = time.split(':')
              hours.value = h ?? '00'
              minutes.value = m ?? '00'
          }
      }
  }, { immediate: true })

  const updateTime = () => {
      let h = parseInt(hours.value)
      let m = parseInt(minutes.value)
      
      if (isNaN(h)) h = 0
      if (isNaN(m)) m = 0
      
      h = Math.max(0, Math.min(23, h))
      m = Math.max(0, Math.min(59, m))
      
      // Formatage 2 chiffres
      hours.value = String(h).padStart(2, '0')
      minutes.value = String(m).padStart(2, '0')
      
      setTime(h, m)
  }

  const adjustTime = (type: 'hours' | 'minutes', amount: number) => {
      if (type === 'hours') {
          let h = parseInt(hours.value) + amount
          if (h > 23) h = 0
          if (h < 0) h = 23
          hours.value = String(h).padStart(2, '0')
      } else {
          let m = parseInt(minutes.value) + amount
          if (m > 59) m = 0
          if (m < 0) m = 59
          minutes.value = String(m).padStart(2, '0')
      }
      updateTime()
  }

  return {
    hours,
    minutes,
    updateTime,
    adjustTime
  }
}