<script setup lang="ts">
import { PATCHNOTE_TYPES } from '~/utils/constants'
import { getNoteItems } from '~/utils/patchnote'

defineProps<{ note: any }>()
</script>

<template>
  <div class="group bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden">
    <!-- Version Badge -->
    <div class="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 min-w-[100px] shrink-0">
        <span class="font-mono text-xl font-black text-blue-600 tracking-tight">{{ note.version }}</span>
        <span class="text-[10px] font-bold text-ui-content-muted uppercase tracking-wider bg-ui-surface-muted px-2 py-0.5 rounded-md">
          {{ new Date(note.created).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' }) }}
        </span>
    </div>
    
    <!-- Divider (Mobile hidden) -->
    <div class="hidden sm:block w-px h-12 bg-ui-border group-hover:bg-blue-100 transition-colors"></div>

    <!-- Content Preview -->
    <div class="flex-1 min-w-0">
        <h3 class="text-lg font-bold text-ui-content group-hover:text-blue-600 transition-colors mb-1 truncate">{{ note.title }}</h3>
        <div class="flex flex-wrap gap-2">
           <!-- Preview badges (first 3 items) -->
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
           <span v-else class="text-xs text-ui-content-muted">Cliquez pour voir les détails...</span>
        </div>
    </div>

    <!-- Arrow -->
    <div class="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
       <Icon name="lucide:arrow-right" class="w-6 h-6 text-blue-500" />
    </div>
 </div>
</template>