<script setup lang="ts">
interface Project {
  name: string
}

defineProps<{
  show: boolean
  project: Project | null
}>()

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
          <Icon name="lucide:triangle-alert" class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer le projet ?</h3>
      </div>
      <p class="text-sm text-ui-content-muted mb-6">
        Êtes-vous sûr de vouloir supprimer le projet <span class="font-bold text-ui-content">{{ project?.name }}</span> ? Cette action est irréversible.
      </p>
      <div class="flex gap-3">
        <UiButton @click="emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
        <UiButton @click="emit('confirm')" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
      </div>
    </div>
  </UiModal>
</template>