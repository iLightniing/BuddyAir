<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

const list = defineModel<string[]>({ required: true })
const emit = defineEmits(['remove'])
</script>

<template>
  <VueDraggable 
    v-model="list"
    :animation="150"
    class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1"
    ghost-class="opacity-50"
  >
    <div v-for="(sub, idx) in list" :key="sub" class="inline-flex items-center gap-2 px-3 py-1.5 bg-ui-surface border border-ui-border rounded-lg text-sm text-ui-content-muted group hover:border-blue-300 transition-colors cursor-grab active:cursor-grabbing">
      <span>{{ sub }}</span>
      <button type="button" @click="emit('remove', idx)" class="text-ui-content-muted group-hover:text-red-500 transition-colors" title="Supprimer">
        <Icon name="lucide:x" class="w-3 h-3" />
      </button>
    </div>
    <p v-if="list.length === 0" class="text-xs text-ui-content-muted italic w-full">Aucune sous-catégorie</p>
  </VueDraggable>
</template>