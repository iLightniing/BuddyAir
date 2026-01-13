<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits(['update:modelValue', 'remove'])

// On initialise avec une copie pour éviter les mutations directes de props
const [parent, list] = useDragAndDrop<string>(props.modelValue, {
  plugins: [animations()]
})

// Synchronisation descendante (Parent -> Enfant)
// Utile quand on ajoute une sous-catégorie depuis le parent
watch(() => props.modelValue, (newVal) => {
  // On compare pour éviter les boucles infinies
  if (JSON.stringify(newVal) !== JSON.stringify(list.value)) {
    list.value = [...newVal]
  }
}, { deep: true })

// Synchronisation ascendante (Enfant -> Parent)
// Utile quand on réorganise la liste via Drag & Drop
watch(list, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
    emit('update:modelValue', newVal)
  }
}, { deep: true })
</script>

<template>
  <div ref="parent" class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
    <div v-for="(sub, idx) in list" :key="sub" class="inline-flex items-center gap-2 px-3 py-1.5 bg-ui-surface border border-ui-border rounded-lg text-sm text-ui-content-muted group hover:border-blue-300 transition-colors cursor-grab active:cursor-grabbing">
      <span>{{ sub }}</span>
      <button type="button" @click="emit('remove', idx)" class="text-ui-content-muted group-hover:text-red-500 transition-colors">
        <Icon name="lucide:x" class="w-3 h-3" />
      </button>
    </div>
    <p v-if="list.length === 0" class="text-xs text-ui-content-muted italic w-full">Aucune sous-catégorie</p>
  </div>
</template>