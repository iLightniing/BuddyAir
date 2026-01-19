<script setup lang="ts">
const props = defineProps<{
  goals: { name: string, target: number, current: number, color: string }[]
}>()

const getPercentage = (current: number, target: number) => Math.min((current / target) * 100, 100)
const firstGoal = computed(() => props.goals[0])
</script>

<template>
  <div v-if="firstGoal" class="flex items-center gap-3 min-w-[140px]">
    <div class="flex-1 h-2 bg-ui-surface-muted rounded-full overflow-hidden">
        <div 
            class="h-full rounded-full transition-all duration-1000 ease-out"
            :class="firstGoal?.color"
            :style="{ width: `${getPercentage(firstGoal?.current ?? 0, firstGoal?.target ?? 1)}%` }"
        ></div>
    </div>
    <span class="text-xs font-bold text-ui-content whitespace-nowrap">{{ Math.round(getPercentage(firstGoal?.current ?? 0, firstGoal?.target ?? 1)) }}%</span>
  </div>
</template>