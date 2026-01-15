<script setup lang="ts">
import { ROADMAP_STATUSES } from '~/utils/constants'

defineProps<{ item: any }>()
defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
       :class="{'bg-ui-surface border-ui-border': item.status === 'in_progress'}">
     <!-- Actions -->
     <div class="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button @click="$emit('edit', item)" class="text-blue-500 hover:text-blue-600 transition-colors"><Icon name="lucide:pencil" class="w-4 h-4" /></button>
        <button @click="$emit('delete', item)" class="text-red-500 hover:text-red-600 transition-colors"><Icon name="lucide:trash-2" class="w-4 h-4" /></button>
     </div>
     <!-- Content -->
     <div class="flex items-center justify-between mb-3">
        <span class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border flex items-center gap-1.5"
              :class="item.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'">
           <span class="w-1.5 h-1.5 rounded-full" :class="item.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'"></span>
           {{ ROADMAP_STATUSES.find(s => s.value === item.status)?.label }}
        </span>
        <Icon :name="ROADMAP_STATUSES.find(s => s.value === item.status)?.icon || 'lucide:circle'" 
              class="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" 
              :class="item.status === 'in_progress' ? 'text-blue-500' : 'text-slate-400'" />
     </div>
     <h3 class="font-bold text-ui-content text-lg mb-2 leading-tight">{{ item.title }}</h3>
     <p class="text-sm text-ui-content-muted leading-relaxed">{{ item.description }}</p>
  </div>
</template>