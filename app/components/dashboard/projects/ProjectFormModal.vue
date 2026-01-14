<script setup lang="ts">
interface Project {
  id: string
}
interface ProjectFormData {
  name: string
  target_amount: number
  saved_amount: number
  deadline?: string
  color: string
  icon: string
}
interface ColorOption {
  value: string
}

const props = defineProps<{
  show: boolean
  editingProject: Project | null
  form: ProjectFormData
  colors: ColorOption[]
  icons: string[]
}>()

const emit = defineEmits(['close', 'save'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-ui-content">{{ editingProject ? 'Modifier le projet' : 'Nouveau Projet' }}</h3>
        <button @click="emit('close')"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
      </div>
      <form class="space-y-5" @submit.prevent="emit('save')">
        <UiInput v-model="form.name" label="Nom du projet" placeholder="Ex: Vacances Bali" />
        <div class="grid grid-cols-2 gap-4">
           <UiInput v-model="form.target_amount" label="Objectif (€)" type="number" placeholder="0.00" />
           <UiInput v-model="form.saved_amount" label="Déjà épargné (€)" type="number" placeholder="0.00" />
        </div>
        <UiDate v-model="form.deadline" label="Date limite (Optionnel)" />
        
        <div>
           <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1 mb-2 block">Apparence</label>
           <div class="flex gap-2 mb-3 overflow-x-auto p-2 -mx-2">
              <button type="button" v-for="c in colors" :key="c.value" @click="form.color = c.value" class="w-8 h-8 rounded-full shrink-0 border-2 transition-all" :class="[c.value, form.color === c.value ? 'border-ui-content scale-110' : 'border-transparent opacity-50 hover:opacity-100']"></button>
           </div>
           <div class="flex gap-2 overflow-x-auto p-2 -mx-2">
              <button type="button" v-for="icon in icons" :key="icon" @click="form.icon = icon" class="w-10 h-10 rounded-lg shrink-0 border flex items-center justify-center transition-all" :class="form.icon === icon ? 'bg-ui-surface border-blue-500 text-blue-500 shadow-sm' : 'bg-ui-surface-muted border-transparent text-ui-content-muted hover:text-ui-content'">
                 <Icon :name="icon" class="w-5 h-5" />
              </button>
           </div>
        </div>

        <div class="pt-4 flex gap-3">
          <UiButton type="button" @click="emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton type="submit" class="flex-1">{{ editingProject ? 'Enregistrer' : 'Créer' }}</UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>