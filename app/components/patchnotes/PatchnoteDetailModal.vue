<script setup lang="ts">
import { PATCHNOTE_TYPES } from '~/utils/constants'
import { getNoteItems } from '~/utils/patchnote'

defineProps<{
  show: boolean
  note: any
}>()

defineEmits(['close'])
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
     <div class="bg-ui-surface border border-ui-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Modal Header -->
        <div class="p-6 border-b border-ui-border bg-ui-surface-muted/30 flex justify-between items-start relative">
           <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500"></div>
           <div>
              <div class="flex items-center gap-3 mb-3">
                 <span class="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-black font-mono shadow-sm shadow-blue-500/30">{{ note?.version }}</span>
                 <span class="text-sm font-medium text-ui-content-muted flex items-center gap-1">
                    <Icon name="lucide:calendar" class="w-3 h-3" />
                    {{ note ? new Date(note.created).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : '' }}
                 </span>
              </div>
              <h2 class="text-2xl font-black text-ui-content leading-tight">{{ note?.title }}</h2>
           </div>
           <button @click="$emit('close')" class="p-2 hover:bg-ui-surface-muted rounded-full transition-colors"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto bg-ui-surface">
           <!-- Affichage Liste Moderne -->
           <div v-if="note && getNoteItems(note.content)" class="space-y-3">
              <div v-for="(item, idx) in getNoteItems(note.content)" :key="idx" 
                   class="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-ui-border hover:bg-ui-surface-muted/30 transition-all group">
                 <div class="shrink-0 mt-0.5">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg shadow-sm" 
                          :class="PATCHNOTE_TYPES.find(t => t.value === item.type)?.class.replace('border', '')">
                       <Icon v-if="item.type === 'feature'" name="lucide:sparkles" class="w-4 h-4" />
                       <Icon v-else-if="item.type === 'fix'" name="lucide:bug" class="w-4 h-4" />
                       <Icon v-else name="lucide:zap" class="w-4 h-4" />
                    </span>
                 </div>
                 <div>
                    <span class="text-[10px] font-black uppercase tracking-wider mb-1 block opacity-70" 
                          :class="PATCHNOTE_TYPES.find(t => t.value === item.type)?.text">
                       {{ PATCHNOTE_TYPES.find(t => t.value === item.type)?.label }}
                    </span>
                    <p class="text-sm text-ui-content leading-relaxed">{{ item.text }}</p>
                 </div>
              </div>
           </div>
           <!-- Fallback Legacy HTML -->
           <div v-else class="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl" v-html="note?.content"></div>
        </div>
        
        <div class="p-4 border-t border-ui-border bg-ui-surface-muted/30 flex justify-end">
           <UiButton @click="$emit('close')">Fermer</UiButton>
        </div>
     </div>
  </UiModal>
</template>