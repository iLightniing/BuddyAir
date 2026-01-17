<script setup lang="ts">
import { PATCHNOTE_TYPES } from '~/utils/constants'
import { getNoteItems } from '~/utils/patchnote'

const props = defineProps<{
  show: boolean
  note: any
}>()

defineEmits(['close'])

const groupedItems = computed(() => {
  if (!props.note) return null
  const items = getNoteItems(props.note.content)
  if (!items) return null
  
  const groups: Record<string, any[]> = {}
  
  items.forEach((item: any) => {
    if (!groups[item.type]) groups[item.type] = []
    groups[item.type]!.push(item)
  })
  
  return groups
})

const getIconForType = (type: string) => {
    if (type === 'feature') return 'lucide:sparkles'
    if (type === 'fix') return 'lucide:bug'
    return 'lucide:zap'
}

const getColorClasses = (type: string) => {
    if (type === 'feature') return { border: 'border-emerald-200', bg: 'bg-emerald-50/50', header: 'bg-emerald-100/50 text-emerald-800 border-emerald-100', bullet: 'bg-emerald-500' }
    if (type === 'fix') return { border: 'border-red-200', bg: 'bg-red-50/50', header: 'bg-red-100/50 text-red-800 border-red-100', bullet: 'bg-red-500' }
    return { border: 'border-blue-200', bg: 'bg-blue-50/50', header: 'bg-blue-100/50 text-blue-800 border-blue-100', bullet: 'bg-blue-500' }
}
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
           <div v-if="note && groupedItems" class="space-y-6">
              <template v-for="typeDef in PATCHNOTE_TYPES" :key="typeDef.value">
                <div v-if="groupedItems[typeDef.value]?.length" 
                     class="rounded-xl border overflow-hidden"
                     :class="[getColorClasses(typeDef.value).border, getColorClasses(typeDef.value).bg]"
                >
                  <div class="px-4 py-3 border-b flex items-center gap-2"
                       :class="getColorClasses(typeDef.value).header">
                     <Icon :name="getIconForType(typeDef.value)" class="w-4 h-4" />
                     <h4 class="font-bold text-xs uppercase tracking-wider">{{ typeDef.label }}</h4>
                     <span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 shadow-sm">
                        {{ groupedItems[typeDef.value]?.length }}
                     </span>
                  </div>
                  
                  <ul class="p-4 space-y-3">
                     <li v-for="(item, idx) in groupedItems[typeDef.value]" :key="idx" class="flex items-start gap-3 text-sm text-ui-content">
                        <span class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" :class="getColorClasses(typeDef.value).bullet"></span>
                        <span class="leading-relaxed">{{ item.text }}</span>
                     </li>
                  </ul>
                </div>
              </template>
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