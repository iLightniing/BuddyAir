<script setup lang="ts">
import { usePatchnotesManager } from '~/composables/usePatchnotesManager'
import RoadmapItem from '~/components/patchnotes/RoadmapItem.vue'
import PatchnoteItem from '~/components/patchnotes/PatchnoteItem.vue'
import PatchnoteDetailModal from '~/components/patchnotes/PatchnoteDetailModal.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Nouveautés'
})

const { patchnotes, roadmap, loading, fetchPatchnotes } = usePatchnotesManager()
const selectedNote = ref<any>(null)
const showNoteModal = ref(false)

const openNote = (note: any) => {
  selectedNote.value = note
  showNoteModal.value = true
}

onMounted(fetchPatchnotes)
</script>

<template>
  <div class="space-y-12">
    <!-- Header -->
    <div class="flex flex-col items-center text-center py-8 space-y-4">
       <div class="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-2 shadow-sm">
          <Icon name="lucide:sparkles" class="w-8 h-8" />
       </div>
       <h1 class="text-4xl md:text-5xl font-black text-ui-content tracking-tight">
         Quoi de neuf sur <span class="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BuddyAir</span> ?
       </h1>
       <p class="text-lg text-ui-content-muted max-w-2xl mx-auto">
         Découvrez les dernières fonctionnalités, les améliorations et ce qui se prépare pour l'avenir de votre gestion financière.
       </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
       <!-- Colonne Gauche : Roadmap (4 cols) -->
       <div class="lg:col-span-4 space-y-6">
          <div class="flex items-center gap-3 mb-2 px-1">
             <div class="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Icon name="lucide:map" class="w-5 h-5" />
             </div>
             <div>
                <h2 class="text-xl font-bold text-ui-content">Roadmap</h2>
                <p class="text-xs text-ui-content-muted font-medium">Prochaines étapes</p>
             </div>
          </div>
          
          <div v-if="loading" class="py-12 flex justify-center">
             <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
          </div>

          <div v-else-if="roadmap.length > 0" class="space-y-4">
             <RoadmapItem v-for="item in roadmap" :key="item.id" :item="item" />
          </div>
          <div v-else class="p-8 text-center border border-ui-border rounded-2xl border-dashed">
             <p class="text-sm text-ui-content-muted italic">Aucune fonctionnalité prévue pour le moment.</p>
          </div>
       </div>

       <!-- Colonne Droite : Patchnotes (8 cols) -->
       <div class="lg:col-span-8 space-y-6">
          <div class="flex items-center gap-3 mb-2 px-1">
             <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Icon name="lucide:history" class="w-5 h-5" />
             </div>
             <div>
                <h2 class="text-xl font-bold text-ui-content">Journal des modifications</h2>
                <p class="text-xs text-ui-content-muted font-medium">Historique des versions</p>
             </div>
          </div>

          <div v-if="loading" class="py-20 flex flex-col items-center justify-center text-ui-content-muted">
             <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin mb-4 text-blue-500" />
             <p class="text-sm font-medium">Chargement de l'historique...</p>
          </div>

          <div v-else class="space-y-4">
             <PatchnoteItem 
                v-for="note in patchnotes" 
                :key="note.id" 
                :note="note" 
                @click="openNote(note)" 
             />
            
             <div v-if="patchnotes.length === 0" class="text-center py-12 text-ui-content-muted border border-ui-border border-dashed rounded-2xl">
                <div class="w-16 h-16 bg-ui-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
                   <Icon name="lucide:clipboard-list" class="w-8 h-8 opacity-50" />
                </div>
                <p>Aucune note de mise à jour pour le moment.</p>
             </div>
          </div>
       </div>
    </div>

    <!-- Modal Détail Patchnote (Design amélioré) -->
    <PatchnoteDetailModal 
      :show="showNoteModal" 
      :note="selectedNote" 
      @close="showNoteModal = false" 
    />
  </div>
</template>

<style>
.prose hr {
  margin-top: 2em;
  margin-bottom: 2em;
  border-color: var(--ui-border);
}
</style>