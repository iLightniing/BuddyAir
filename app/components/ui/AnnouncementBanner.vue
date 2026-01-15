<script setup lang="ts">
import { useAnnouncements } from '~/composables/useAnnouncements'

const { activeAnnouncement, fetchActive } = useAnnouncements()

onMounted(fetchActive)

const typeClasses = computed(() => {
  switch (activeAnnouncement.value?.type) {
    case 'warning': return 'bg-amber-500 text-white'
    case 'error': return 'bg-red-500 text-white'
    case 'success': return 'bg-emerald-500 text-white'
    default: return 'bg-blue-600 text-white'
  }
})

const iconName = computed(() => {
  switch (activeAnnouncement.value?.type) {
    case 'warning': return 'lucide:alert-triangle'
    case 'error': return 'lucide:alert-octagon'
    case 'success': return 'lucide:check-circle'
    default: return 'lucide:info'
  }
})
</script>

<template>
  <div 
    v-if="activeAnnouncement" 
    class="w-full px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium relative z-50 shadow-sm"
    :class="typeClasses"
  >
    <Icon :name="iconName" class="w-4 h-4 shrink-0" />
    <span class="text-center">
      <strong v-if="activeAnnouncement.title" class="mr-1">{{ activeAnnouncement.title }} :</strong>
      {{ activeAnnouncement.message }}
    </span>
  </div>
</template>