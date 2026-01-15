<script setup lang="ts">
import { PATCHNOTE_TYPES } from '~/utils/constants'
import { getNoteItems } from '~/utils/patchnote'

defineProps<{ note: any }>()
defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="group bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start gap-6 relative overflow-hidden">
      <!-- Actions -->
     <div class="absolute top-1/2 right-6 -translate-y-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button @click="$emit('edit', note)" class="text-blue-500 hover:text-blue-600 transition-colors"><Icon name="lucide:pencil" class="w-4 h-4" /></button>
        <button @click="$emit('delete', note)" class="text-red-500 hover:text-red-600 transition-colors"><Icon name="lucide:trash-2" class="w-4 h-4" /></button>
     </div>

     <!-- Version Badge -->
     <div class="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 min-w-[100px] shrink-0">
         <span class="font-mono text-xl font-black text-blue-600 tracking-tight">{{ note.version }}</span>
         <span class="text-[10px] font-bold text-ui-content-muted uppercase tracking-wider bg-ui-surface-muted px-2 py-0.5 rounded-md">
           {{ new Date(note.created).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' }) }}
         </span>
     </div>
     
     <!-- Divider -->
     <div class="hidden sm:block w-px self-stretch bg-ui-border group-hover:bg-blue-100 transition-colors"></div>

     <!-- Content Preview -->
     <div class="flex-1 min-w-0 pr-16">
         <h3 class="text-lg font-bold text-ui-content group-hover:text-blue-600 transition-colors mb-2 truncate">{{ note.title }}</h3>
         <div class="flex flex-wrap gap-2">
            <template v-if="getNoteItems(note.content)">
              <span v-for="(item, idx) in (getNoteItems(note.content) || []).slice(0, 3)" :key="idx" 
                    class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border bg-opacity-50"
                    :class="PATCHNOTE_TYPES.find(t => t.value === item.type)?.class.replace('bg-', 'border-').replace('text-', 'text-')">
                 {{ PATCHNOTE_TYPES.find(t => t.value === item.type)?.label }}
              </span>
              <span v-if="(getNoteItems(note.content)?.length || 0) > 3" class="text-[10px] text-ui-content-muted font-medium self-center">
                 +{{ (getNoteItems(note.content)?.length || 0) - 3 }} autres
              </span>
            </template>
            <span v-else class="text-xs text-ui-content-muted">Contenu HTML (Legacy)</span>
        </div>
     </div>
  </div>
</template>