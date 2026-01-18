<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { useCategoriesManager } from '~/composables/useCategoriesManager'
import CategoryCard from './CategoryCard.vue'

const {
  categoriesList,
  showModal,
  categoryForm,
  showDeleteModal,
  categoryToDelete,
  init,
  updateOrder,
  openModal,
  saveCategory,
  handleSaveCategory,
  requestDelete,
  confirmDelete
} = useCategoriesManager(false)

onMounted(init)

const openCreateModal = () => {
  openModal()
  categoryForm.value.sub_categories = []
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-black text-ui-content">Gestion des catégories</h2>
        <p class="text-sm text-ui-content-muted">Organisez vos dépenses. Les catégories avec <Icon name="lucide:lock" class="w-3 h-3 inline" /> sont gérées par l'administrateur.</p>
      </div>
      <UiButton @click="openCreateModal()" class="shadow-lg shadow-blue-500/20">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" /> Nouvelle catégorie
      </UiButton>
    </div>

    <!-- Grille des catégories -->
    <VueDraggable 
      v-model="categoriesList"
      :animation="300"
      handle=".drag-handle-cat"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start"
      @end="updateOrder"
    >
      <CategoryCard 
        v-for="cat in categoriesList" 
        :key="cat.id" 
        :category="cat"
        @save="handleSaveCategory"
        @delete="requestDelete"
      />
    </VueDraggable>

    <!-- Modales -->
    <UiModal :show="showModal" @close="showModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-sm w-full">
        <h3 class="text-lg font-black text-ui-content mb-4">Nouvelle catégorie</h3>
        <form @submit.prevent="saveCategory" class="space-y-4">
          <UiInput v-model="categoryForm.name" label="Nom" placeholder="Ex: Loisirs" required autofocus />
          <div class="flex justify-end gap-2 pt-2">
            <UiButton type="button" @click="showModal = false" variant="secondary">Annuler</UiButton>
            <UiButton type="submit">Créer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:triangle-alert" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer la catégorie ?</h3>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer <span class="font-bold text-ui-content">{{ categoryToDelete?.name }}</span> ?
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>