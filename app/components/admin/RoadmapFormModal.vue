<script setup lang="ts">
import { ROADMAP_STATUSES } from '~/utils/constants'

defineProps<{
  show: boolean
  form: any
}>()

defineEmits(['close', 'save'])
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl w-full max-w-lg">
      <h3 class="text-xl font-black text-ui-content mb-6">Élément de Roadmap</h3>
      <form @submit.prevent="$emit('save')" class="space-y-4">
        <UiInput v-model="form.title" label="Fonctionnalité" placeholder="Ex: Mode sombre" required />
        <div class="space-y-1">
           <label class="text-xs font-bold text-ui-content-muted uppercase">Statut</label>
           <div class="grid grid-cols-3 gap-2">
              <button type="button" v-for="status in ROADMAP_STATUSES" :key="status.value" @click="form.status = status.value"
                 class="p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all"
                 :class="form.status === status.value ? status.class.replace('bg-', 'bg-opacity-100 ring-2 ring-offset-1 ring-blue-500 ') : 'bg-ui-surface border-ui-border text-ui-content-muted hover:bg-ui-surface-muted'">
                 <Icon :name="status.icon" class="w-4 h-4" />
                 {{ status.label }}
              </button>
           </div>
        </div>
        <div class="space-y-1">
           <label class="text-xs font-bold text-ui-content-muted uppercase">Description courte</label>
           <textarea v-model="form.description" rows="3" class="w-full p-3 bg-ui-surface border border-ui-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Bientôt disponible..."></textarea>
        </div>
        <div class="flex gap-3 pt-2">
          <UiButton type="button" @click="$emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton type="submit" class="flex-1">Enregistrer</UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>