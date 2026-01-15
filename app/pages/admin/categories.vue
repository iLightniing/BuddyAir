<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { useCategoriesManager } from '~/composables/useCategoriesManager'
import CategoryCard from '~/components/settings/CategoryCard.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Gestion des Catégories Globales',
  middleware: ['admin']
})

const {
  categoriesList,
  showModal,
  categoryForm,
  showDeleteModal,
  categoryToDelete,
  init,
  openModal,
  saveCategory,
  handleSaveCategory,
  requestDelete,
  confirmDelete,
  updateOrder
} = useCategoriesManager(true)

onMounted(init)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UiBackButton to="/admin" />
        <div>
            <h1 class="text-2xl font-black text-ui-content tracking-tight">Catégories Globales</h1>
            <p class="text-sm text-ui-content-muted">Ces catégories seront visibles par tous les utilisateurs comme base.</p>
        </div>
      </div>
      <UiButton @click="openModal()" class="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 border-indigo-700 text-white">
        <Icon name="lucide:globe" class="w-4 h-4 mr-2" /> Nouvelle catégorie globale
      </UiButton>
    </div>

    <!-- Grille -->
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
        :is-admin="true"
        @save="handleSaveCategory"
        @delete="requestDelete"
      />
    </VueDraggable>

    <!-- Modales -->
    <UiModal :show="showModal" @close="showModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-sm w-full">
        <h3 class="text-lg font-black text-ui-content mb-4">{{ categoryForm.id ? 'Modifier' : 'Nouvelle' }} catégorie globale</h3>
        <form @submit.prevent="saveCategory" class="space-y-4">
          <UiInput v-model="categoryForm.name" label="Nom" placeholder="Ex: Alimentation" required autofocus />
          <div class="flex justify-end gap-2 pt-2">
            <UiButton type="button" @click="showModal = false" variant="secondary">Annuler</UiButton>
            <UiButton type="submit" class="bg-indigo-600 hover:bg-indigo-700 border-indigo-700 text-white">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:triangle-alert" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer la base globale ?</h3>
        <p class="text-sm text-ui-content-muted mb-6">
          Si vous supprimez <span class="font-bold text-ui-content">{{ categoryToDelete?.name }}</span>, elle ne sera plus proposée aux nouveaux utilisateurs. Les utilisateurs existants conserveront leur copie locale s'ils l'ont modifiée.
        </p>
        <div class="flex gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>