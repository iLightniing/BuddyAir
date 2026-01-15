<script setup lang="ts">
import { PATCHNOTE_TYPES } from '~/utils/constants'

interface PatchnoteItem {
  type: string
  text: string
}

interface PatchnoteForm {
  id: string
  version: string
  title: string
  items: PatchnoteItem[]
}

const props = defineProps<{
  show: boolean
  form: PatchnoteForm
}>()

const emit = defineEmits(['close', 'save'])

const addItem = () => {
  props.form.items.push({ type: 'feature', text: '' })
}

const removeItem = (index: number) => {
  props.form.items.splice(index, 1)
}

const cycleType = (item: any) => {
  const currentIndex = PATCHNOTE_TYPES.findIndex(t => t.value === item.type)
  const nextIndex = (currentIndex + 1) % PATCHNOTE_TYPES.length
  item.type = PATCHNOTE_TYPES[nextIndex]?.value
}
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
      <h3 class="text-xl font-black text-ui-content mb-6 shrink-0">{{ form.id ? 'Modifier' : 'Publier' }} un patchnote</h3>
      <form @submit.prevent="$emit('save')" class="flex flex-col min-h-0 gap-4">
        <div class="overflow-y-auto pr-2 -mr-2 flex-1 space-y-4 pb-32">
          <UiInput v-model="form.version" label="Version" placeholder="v1.0.0" required />
          <UiInput v-model="form.title" label="Titre" placeholder="Quoi de neuf ?" required />
          
          <div class="space-y-1">
             <label class="text-xs font-bold text-ui-content-muted uppercase">Changements</label>
             <div class="space-y-2">
                <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 items-start" :style="{ zIndex: 50 - index }">
                   <button type="button" @click="cycleType(item)" class="w-32 shrink-0 h-10 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all hover:brightness-95" :class="PATCHNOTE_TYPES.find(t => t.value === item.type)?.class">
                      {{ PATCHNOTE_TYPES.find(t => t.value === item.type)?.label }}
                   </button>
                   <input v-model="item.text" type="text" class="flex-1 h-10 px-3 rounded-lg border border-ui-border bg-ui-surface text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Description du changement..." required />
                   <button type="button" @click="removeItem(index)" class="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer la ligne">
                      <Icon name="lucide:x" class="w-4 h-4" />
                   </button>
                </div>
                <button type="button" @click="addItem" class="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">
                   <Icon name="lucide:plus-circle" class="w-4 h-4" /> Ajouter une ligne
                </button>
             </div>
          </div>
        </div>
        <div class="flex gap-3 pt-4 shrink-0 border-t border-ui-border">
          <UiButton type="button" @click="$emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton type="submit" class="flex-1">Enregistrer</UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>