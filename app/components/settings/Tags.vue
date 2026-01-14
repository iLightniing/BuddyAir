<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { useTags } from '~/composables/useTags'

const { tags, loading, colors, fetchTags, saveTag, deleteTag, getTagClass } = useTags()
const pb = usePocketBase()

onMounted(fetchTags)

const showModal = ref(false)
const showDeleteModal = ref(false)
const tagToDelete = ref<any>(null)
const isSaving = ref(false)

const form = ref({
  id: '',
  name: '',
  color: 'slate'
})

const openModal = (tag?: any) => {
  if (tag) {
    form.value = { ...tag }
  } else {
    form.value = { id: '', name: '', color: 'slate' }
  }
  showModal.value = true
}

const handleSubmit = async () => {
  isSaving.value = true
  const success = await saveTag(form.value)
  isSaving.value = false
  if (success) showModal.value = false
}

const confirmDelete = (tag: any) => {
  tagToDelete.value = tag
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (tagToDelete.value) {
    await deleteTag(tagToDelete.value.id)
    showDeleteModal.value = false
  }
}

const updateOrder = async () => {
  const promises = tags.value.map((tag, index) => {
    return pb.collection('tags').update(tag.id, { order: index })
  })
  try { await Promise.all(promises) } catch (e) {}
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-black text-ui-content">Tags</h2>
        <p class="text-sm text-ui-content-muted">Marquez vos transactions (ex: #Vacances, #Projet).</p>
      </div>
      <UiButton @click="openModal()" variant="primary" class="shadow-sm">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Nouveau tag
      </UiButton>
    </div>

    <div v-if="loading" class="py-12 flex justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <div v-else-if="tags.length === 0" class="bg-ui-surface border border-ui-border rounded-xl p-8 text-center">
      <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="lucide:tag" class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-ui-content">Aucun tag</h3>
      <p class="text-sm text-ui-content-muted mt-2 max-w-md mx-auto">
        Créez des tags pour organiser vos dépenses de manière transversale, indépendamment des catégories.
      </p>
    </div>

    <VueDraggable 
      v-else 
      v-model="tags"
      :animation="150"
      class="flex flex-wrap gap-3"
      @end="updateOrder"
    >
      <div v-for="tag in tags" :key="tag.id" class="group relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-move hover:shadow-md hover:scale-105 active:scale-95" :class="getTagClass(tag.color)">
        <span class="text-xs font-bold">
          # {{ tag.name }}
        </span>

        <div class="flex items-center gap-1 ml-1 w-0 overflow-hidden group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button @click.stop="openModal(tag)" class="p-1 hover:bg-black/5 rounded-full transition-colors" title="Modifier">
            <Icon name="lucide:pencil" class="w-3 h-3" />
          </button>
          <button @click.stop="confirmDelete(tag)" class="p-1 hover:bg-red-500/10 text-red-600 rounded-full transition-colors" title="Supprimer">
            <Icon name="lucide:x" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </VueDraggable>

    <!-- Modal Édition -->
    <UiModal :show="showModal" @close="showModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-lg font-black text-ui-content mb-6">{{ form.id ? 'Modifier le tag' : 'Nouveau tag' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <UiInput v-model="form.name" label="Nom" placeholder="Ex: Vacances 2024" required />
          
          <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1 mb-2 block">Couleur</label>
            <div class="grid grid-cols-5 gap-2">
              <button 
                v-for="color in colors" 
                :key="color.value"
                type="button"
                @click="form.color = color.value"
                class="h-8 rounded-md border transition-all flex items-center justify-center"
                :class="[
                  color.class,
                  form.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'opacity-70 hover:opacity-100'
                ]"
                :title="color.name"
              >
                <Icon v-if="form.color === color.value" name="lucide:check" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <UiButton type="button" @click="showModal = false" variant="secondary">Annuler</UiButton>
            <UiButton type="submit" :loading="isSaving">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:trash-2" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer ce tag ?</h3>
        <div class="flex justify-center gap-3 mt-6">
          <UiButton @click="showDeleteModal = false" variant="secondary">Annuler</UiButton>
          <UiButton @click="handleDelete" class="bg-red-600 hover:bg-red-700 text-white border-red-600">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>