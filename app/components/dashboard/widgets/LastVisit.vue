<script setup lang="ts">
const props = defineProps<{
  lastActivityDate?: string
}>()

const isMounted = ref(false)
onMounted(() => isMounted.value = true)

const timeSinceLastVisit = computed(() => {
  if (!props.lastActivityDate || !isMounted.value) return null
  const date = new Date(props.lastActivityDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  return `Il y a ${diffDays} jours`
})
</script>

<template>
  <div class="bg-ui-surface p-4 rounded-xl border border-sky-200 shadow-sm flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-md">
    <div class="flex items-start justify-between mb-2 relative z-10">
       <div class="flex flex-col">
          <span class="text-sm font-medium text-ui-content-muted">Dernière visite</span>
          <div class="text-2xl font-black tracking-tight mt-1 text-sky-600">
             {{ timeSinceLastVisit || 'Bienvenue' }}
          </div>
       </div>
       <div class="p-2 rounded-xl flex items-center justify-center bg-sky-100">
          <Icon name="lucide:calendar-clock" class="w-8 h-8 text-sky-600" />
       </div>
    </div>
    
    <p class="text-xs font-medium text-ui-content-muted relative z-10 leading-relaxed">
      <span v-if="lastActivityDate && isMounted">
         Ravi de vous revoir ! Votre dernière connexion remonte au <span class="font-bold text-sky-700">{{ new Date(lastActivityDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) }}</span>.
      </span>
      <span v-else>
         C'est votre première visite. Bienvenue sur votre tableau de bord !
      </span>
    </p>
  </div>
</template>