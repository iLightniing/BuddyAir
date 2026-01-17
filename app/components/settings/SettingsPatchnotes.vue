<script setup lang="ts">
import { usePatchnotesManager } from '~/composables/usePatchnotesManager'
import PatchnoteItem from '~/components/patchnotes/PatchnoteItem.vue'
import RoadmapItem from '~/components/patchnotes/RoadmapItem.vue'
import PatchnoteDetailModal from '~/components/patchnotes/PatchnoteDetailModal.vue'

const { patchnotes, roadmap, loading, fetchPatchnotes } = usePatchnotesManager()
const selectedNote = ref(null)
const showDetailModal = ref(false)

const openNote = (note: any) => {
  selectedNote.value = note
  showDetailModal.value = true
}

onMounted(fetchPatchnotes)
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="flex justify-center py-12">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Roadmap -->
        <div class="lg:col-span-4 space-y-4">
            <div class="flex items-center gap-2 mb-2">
                <div class="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Icon name="lucide:map" class="w-4 h-4" />
                </div>
                <h4 class="font-bold text-ui-content">Roadmap</h4>
            </div>
            
            <div v-if="roadmap.length > 0" class="space-y-3">
                <RoadmapItem v-for="item in roadmap" :key="item.id" :item="item" />
            </div>
            <div v-else class="p-6 text-center border border-ui-border border-dashed rounded-xl">
                <p class="text-sm text-ui-content-muted italic">Aucune fonctionnalité prévue.</p>
            </div>
        </div>

        <!-- Patchnotes -->
        <div class="lg:col-span-8 space-y-4">
            <div class="flex items-center gap-2 mb-2">
                <div class="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Icon name="lucide:history" class="w-4 h-4" />
                </div>
                <h4 class="font-bold text-ui-content">Journal des modifications</h4>
            </div>

            <div v-if="patchnotes.length > 0" class="space-y-4">
                <PatchnoteItem 
                    v-for="note in patchnotes" 
                    :key="note.id" 
                    :note="note" 
                    @click="openNote(note)"
                />
            </div>
            <div v-else class="p-12 text-center border border-ui-border border-dashed rounded-xl">
                <p class="text-sm text-ui-content-muted italic">Aucun historique disponible.</p>
            </div>
        </div>
    </div>

    <PatchnoteDetailModal 
        :show="showDetailModal" 
        :note="selectedNote" 
        @close="showDetailModal = false" 
    />
  </div>
</template>