<script setup lang="ts">
defineProps<{
  show: boolean
  project: any
}>()

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500"><Icon name="lucide:archive" class="w-5 h-5" /></div>
        <h3 class="text-lg font-black text-ui-content tracking-tight">Archiver le projet ?</h3>
      </div>
      <p class="text-sm text-ui-content-muted mb-6">Le projet <span class="font-bold text-ui-content">{{ project?.name }}</span> sera déplacé dans les archives. Vous pourrez le consulter ou le restaurer plus tard.</p>
      <div class="flex gap-3">
        <UiButton @click="emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
        <UiButton @click="emit('confirm')" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xl shadow-purple-500/20">Archiver</UiButton>
      </div>
    </div>
  </UiModal>
</template>