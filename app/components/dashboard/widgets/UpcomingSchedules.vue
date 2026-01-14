<script setup lang="ts">
defineProps<{
  schedules: any[]
  loading: boolean
}>()

const { getTransactionIcon, getTransactionClass } = useDashboardData()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}

const getRelativeDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Demain"
  if (diffDays > 1 && diffDays <= 7) return `Dans ${diffDays} jours`
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(dateString))
}
</script>

<template>
  <div class="bg-ui-surface rounded-xl border border-ui-border shadow-sm flex flex-col h-fit">
    <div class="p-5 border-b border-ui-border flex justify-between items-center">
      <h3 class="font-bold text-ui-content flex items-center gap-2">
        <Icon name="lucide:calendar-clock" class="w-5 h-5 text-ui-content-muted" />
        Prochaines échéances
      </h3>
      <NuxtLink to="/dashboard/schedule" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Gérer</NuxtLink>
    </div>
    <div class="p-3">
      <div v-if="loading" class="p-4 text-center"><Icon name="lucide:loader-2" class="w-5 h-5 animate-spin text-ui-content-muted mx-auto" /></div>
      <div v-else-if="!schedules || schedules.length === 0" class="p-4 text-center text-ui-content-muted text-sm italic">Aucune échéance à venir.</div>
      <div v-else class="space-y-1">
        <div v-for="schedule in schedules" :key="schedule.id" class="flex items-center justify-between p-2 rounded-lg hover:bg-ui-surface-muted/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getTransactionClass(schedule.type).replace('border', 'bg-opacity-10')">
              <Icon :name="getTransactionIcon(schedule.type)" class="w-4 h-4" />
            </div>
            <div>
              <p class="font-medium text-ui-content text-sm truncate max-w-[120px]">{{ schedule.description }}</p>
              <p class="text-xs text-ui-content-muted">{{ schedule.expand.account.name }}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="font-bold text-sm tabular-nums" :class="schedule.type === 'income' ? 'text-emerald-600' : 'text-ui-content'">
              {{ schedule.type === 'income' ? '+' : '-' }}{{ formatCurrency(schedule.amount) }}
            </span>
            <p class="text-xs font-medium text-blue-500">{{ getRelativeDate(schedule.next_date) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>