<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: { label: string; value: number }[]
  color?: string
}>()

const maxVal = computed(() => Math.max(...props.data.map(d => d.value), 1))

const normalizedData = computed(() => {
  return props.data.map(d => ({
    ...d,
    height: (d.value / maxVal.value) * 100
  }))
})

const barColorClass = computed(() => {
  switch (props.color) {
    case 'amber': return 'bg-amber-200 hover:bg-amber-300'
    case 'emerald': return 'bg-emerald-200 hover:bg-emerald-300'
    default: return 'bg-blue-200 hover:bg-blue-300'
  }
})
</script>

<template>
  <div class="w-full h-48 flex items-end gap-1 sm:gap-2 pt-8 pb-2 relative select-none">
    <!-- Lignes de repère (Fond) -->
    <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
      <div class="border-t border-dashed border-ui-border w-full h-px"></div>
      <div class="border-t border-dashed border-ui-border w-full h-px"></div>
      <div class="border-t border-dashed border-ui-border w-full h-px"></div>
      <div class="border-t border-ui-border w-full h-px"></div>
    </div>

    <!-- Barres -->
    <div 
      v-for="(point, index) in normalizedData" 
      :key="index" 
      class="flex-1 flex flex-col justify-end group relative min-w-[4px]"
    >
      <div 
        class="w-full rounded-t-sm transition-all duration-500 ease-out relative"
        :class="barColorClass"
        :style="{ height: `${point.height}%` }"
      >
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg font-bold">
          {{ point.value }}
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      </div>
      
      <!-- Label Axe X -->
      <div class="text-[9px] text-ui-content-muted text-center mt-1 truncate w-full opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity absolute top-full left-0">
        {{ point.label }}
      </div>
    </div>
  </div>
</template>