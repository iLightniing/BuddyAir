<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { useCategoriesManager } from '~/composables/useCategoriesManager'

const {
  categoriesList,
  showModal,
  categoryForm,
  newSubCategoryName,
  showDeleteModal,
  categoryToDelete,
  init,
  updateOrder,
  openModal,
  saveCategory,
  addSubCategory,
  removeSubCategory,
  requestDelete,
  confirmDelete
} = useCategoriesManager()

onMounted(init)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-black text-ui-content">Gestion des catégories</h2>
        <p class="text-sm text-ui-content-muted">Personnalisez vos catégories de dépenses et revenus.</p>
      </div>
      <UiButton @click="openModal()" class="shadow-lg shadow-blue-500/20">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" /> Nouvelle catégorie
      </UiButton>
    </div>

    <VueDraggable 
      v-model="categoriesList"
      :animation="150"
      handle=".drag-handle-cat"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      @end="updateOrder"
    >
      <div v-for="cat in categoriesList" :key="cat.id" class="bg-ui-surface border border-ui-border rounded-xl p-4 hover:border-blue-300/50 transition-all group relative flex flex-col gap-3 shadow-sm hover:shadow-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="drag-handle-cat cursor-grab active:cursor-grabbing text-ui-content-muted hover:text-ui-content p-1 -ml-1 touch-none">
              <Icon name="lucide:grip-vertical" class="w-4 h-4 pointer-events-none" />
            </div>
            <span class="font-bold text-ui-content truncate">{{ cat.name }}</span>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openModal(cat)" class="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors" title="Modifier"><Icon name="lucide:pencil" class="w-3.5 h-3.5" /></button>
            <button @click="requestDelete(cat)" class="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors" title="Supprimer"><Icon name="lucide:trash-2" class="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div class="pl-8">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-ui-surface-muted text-ui-content-muted border border-ui-border">
            {{ cat.sub_categories?.length || 0 }} sous-catégories
          </span>
        </div>
      </div>
    </VueDraggable>

    <!-- Modal Édition -->
    <UiModal :show="showModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-ui-content tracking-tight">
            {{ categoryForm.id ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
          </h3>
          <button @click="showModal = false" class="text-ui-content-muted hover:text-ui-content transition-colors" title="Fermer">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveCategory" class="space-y-6">
          <UiInput v-model="categoryForm.name" label="Nom de la catégorie" placeholder="Ex: Alimentation" required />

          <div class="space-y-3">
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Sous-catégories</label>
            
            <div class="flex gap-2">
              <input 
                v-model="newSubCategoryName" 
                @keydown.enter.prevent="addSubCategory"
                placeholder="Ajouter une sous-catégorie..." 
                class="flex-1 bg-ui-surface border border-ui-border rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
              />
              <button type="button" @click="addSubCategory" class="px-3 py-2 bg-ui-surface-muted hover:bg-ui-border rounded-md text-ui-content transition-colors" title="Ajouter">
                <Icon name="lucide:plus" class="w-4 h-4" />
              </button>
            </div>

            <SettingsSubCategoryList v-model="categoryForm.sub_categories" @remove="removeSubCategory" />
          </div>

          <div class="pt-2">
            <UiButton type="submit" class="w-full">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer la catégorie ?</h3>
        </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer la catégorie <span class="font-bold text-ui-content">{{ categoryToDelete?.name }}</span> et toutes ses sous-catégories ?
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>