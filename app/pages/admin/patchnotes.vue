<script setup lang="ts">
import { usePatchnotesManager } from '~/composables/usePatchnotesManager'
import AdminRoadmapItem from '~/components/admin/RoadmapItem.vue'
import AdminPatchnoteItem from '~/components/admin/PatchnoteItem.vue'
import AdminRoadmapForm from '~/components/admin/RoadmapFormModal.vue'
import AdminPatchnoteForm from '~/components/admin/PatchnoteFormModal.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Gestion des Patchnotes',
  middleware: ['admin']
})

const {
  patchnotes, roadmap, loading,
  showModal, showDeleteModal, deleteType, form,
  showRoadmapModal, roadmapForm,
  fetchPatchnotes, openModal, save, confirmDelete, openRoadmapModal, saveRoadmap, requestDeletePatchnote, requestDeleteRoadmapItem
} = usePatchnotesManager()

onMounted(fetchPatchnotes)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <UiBackButton to="/admin" />
        <div>
            <h1 class="text-3xl font-black text-ui-content tracking-tight">Gestion des mises à jour</h1>
            <p class="text-ui-content-muted">Pilotez la roadmap et le journal des modifications</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Colonne Gauche : Roadmap (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
             <div class="flex items-center justify-between h-10">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Icon name="lucide:map" class="w-5 h-5" />
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-ui-content">Roadmap</h2>
                        <p class="text-xs text-ui-content-muted font-medium">Fonctionnalités à venir</p>
                    </div>
                </div>
                <UiButton @click="openRoadmapModal()" variant="secondary" class="!px-3">
                    <Icon name="lucide:plus" class="w-4 h-4" />
                </UiButton>
             </div>
             
             <div v-if="loading" class="py-12 flex justify-center">
                <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
             </div>

             <div v-else-if="roadmap.length > 0" class="space-y-4">
                <AdminRoadmapItem 
                  v-for="item in roadmap" 
                  :key="item.id" 
                  :item="item" 
                  @edit="openRoadmapModal" 
                  @delete="requestDeleteRoadmapItem" 
                />
             </div>
             <div v-else class="p-8 text-center border border-ui-border rounded-2xl border-dashed">
                <p class="text-sm text-ui-content-muted italic">La roadmap est vide.</p>
             </div>
        </div>

        <!-- Colonne Droite : Patchnotes (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
             <div class="flex items-center justify-between h-10">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Icon name="lucide:history" class="w-5 h-5" />
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-ui-content">Journal des modifications</h2>
                        <p class="text-xs text-ui-content-muted font-medium">Versions publiées</p>
                    </div>
                </div>
                <UiButton @click="openModal()">
                    <Icon name="lucide:plus" class="w-4 h-4 mr-2" /> Nouveau Patch
                </UiButton>
             </div>
             
             <div v-if="loading" class="py-20 flex flex-col items-center justify-center text-ui-content-muted">
                <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p class="text-sm font-medium">Chargement...</p>
             </div>

             <div v-else-if="patchnotes.length === 0" class="p-12 text-center text-ui-content-muted border border-ui-border border-dashed rounded-2xl">
                Aucun patchnote publié pour le moment.
             </div>

             <div v-else class="space-y-4">
                <AdminPatchnoteItem 
                  v-for="note in patchnotes" 
                  :key="note.id" 
                  :note="note" 
                  @edit="openModal" 
                  @delete="requestDeletePatchnote" 
                />
             </div>
        </div>
    </div>

    <!-- Modal Édition -->
    <AdminPatchnoteForm 
      :show="showModal" 
      :form="form" 
      @close="showModal = false" 
      @save="save" 
    />

    <!-- Modal Roadmap -->
    <AdminRoadmapForm 
      :show="showRoadmapModal" 
      :form="roadmapForm" 
      @close="showRoadmapModal = false" 
      @save="saveRoadmap" 
    />

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
       <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
          <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Icon name="lucide:trash-2" class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer {{ deleteType === 'patchnote' ? 'ce patchnote' : 'cet élément' }} ?</h3>
          <p class="text-sm text-ui-content-muted mb-6">Cette action est irréversible.</p>
          <div class="flex gap-3">
             <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
             <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700">Supprimer</UiButton>
          </div>
       </div>
    </UiModal>
  </div>
</template>

<style>
.prose hr {
  margin-top: 2em;
  margin-bottom: 2em;
  border-color: var(--ui-border);
}
</style>