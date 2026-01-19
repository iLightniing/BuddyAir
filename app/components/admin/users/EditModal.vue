<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotification } from '#imports'

const props = defineProps<{
  show: boolean
  user: any
  roles: any[]
}>()

const emit = defineEmits(['close', 'saved'])
const { notify } = useNotification()

const role = ref(1)
const extensionDate = ref<Date | null>(null)
const isSaving = ref(false)

watch([() => props.show, () => props.user], ([isOpen, user]: [any, any]) => {
  if (isOpen && user) {
    role.value = user.role
    if (user.role === 2) {
        const currentEnd = user.current_period_end ? new Date(user.current_period_end) : new Date()
        if (isNaN(currentEnd.getTime()) || currentEnd < new Date()) {
            const nextMonth = new Date()
            nextMonth.setMonth(nextMonth.getMonth() + 1)
            extensionDate.value = nextMonth
        } else {
            extensionDate.value = currentEnd
        }
    } else {
        extensionDate.value = null
    }
  }
}, { immediate: true })

const toDatetimeLocal = (date: Date | null) => {
  if (!date) return ''
  const offset = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - offset)
  return localDate.toISOString().slice(0, 16)
}

const addMonths = (count: number) => {
  if (!extensionDate.value) extensionDate.value = new Date()
  const d = new Date(extensionDate.value)
  d.setMonth(d.getMonth() + count)
  extensionDate.value = d
}

const save = async () => {
  if (!props.user) return
  isSaving.value = true
  try {
    await $fetch('/api/admin/users/update', {
      method: 'POST',
      body: {
        id: props.user.id,
        role: role.value,
        extensionDate: role.value === 2 ? extensionDate.value : null
      }
    })
    notify('Utilisateur mis à jour avec succès', 'success')
    emit('saved')
  } catch (e) {
    notify('Erreur lors de la mise à jour', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
    <UiModal :show="show" @close="$emit('close')">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3 class="text-xl font-black text-ui-content mb-6">Modifier le rôle</h3>
        <form @submit.prevent="save" class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-ui-content-muted uppercase">Rôle attribué</label>
            <div class="space-y-2">
              <label v-for="r in roles" :key="r.value" class="flex items-center gap-3 p-3 border border-ui-border rounded-lg cursor-pointer hover:bg-ui-surface-muted transition-colors">
                <input type="radio" v-model="role" :value="r.value" class="w-4 h-4 text-blue-600" />
                <span class="text-sm font-bold" :class="r.value === role ? 'text-ui-content' : 'text-ui-content-muted'">{{ r.label }}</span>
              </label>
            </div>
          </div>

          <div v-if="role === 2" class="space-y-2 animate-in slide-in-from-top-2">
             <label class="text-xs font-bold text-ui-content-muted uppercase">Fin de l'abonnement / Prochain prélèvement</label>
             <div class="relative">
                 <Icon name="lucide:calendar-clock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted pointer-events-none" />
                 <input type="datetime-local" :value="toDatetimeLocal(extensionDate)" @input="(e: any) => extensionDate = e.target.value ? new Date(e.target.value) : null" class="w-full pl-10 pr-4 py-2.5 border border-ui-border rounded-lg bg-ui-surface text-ui-content text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" />
             </div>
             <div class="flex gap-2">
                <button type="button" @click="addMonths(1)" class="flex-1 px-2 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-100">+1 Mois</button>
                <button type="button" @click="addMonths(3)" class="flex-1 px-2 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-100">+3 Mois</button>
                <button type="button" @click="addMonths(6)" class="flex-1 px-2 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-100">+6 Mois</button>
             </div>
          </div>
          <div class="flex gap-3"><UiButton type="button" @click="$emit('close')" variant="secondary" class="flex-1">Annuler</UiButton><UiButton type="submit" class="flex-1" :loading="isSaving">Enregistrer</UiButton></div>
        </form>
      </div>
    </UiModal>
</template>