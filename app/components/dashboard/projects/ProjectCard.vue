<script setup lang="ts">
defineProps<{
  project: any
  getDeadlineBadge: (date: string) => any
  getMonthlyEffort: (project: any) => any
}>()

const emit = defineEmits(['history', 'edit', 'delete', 'transfer', 'archive', 'restore'])
</script>

<template>
  <div 
    class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-grab active:cursor-grabbing"
    :class="{ 'ring-2 ring-amber-400/50': project.saved_amount >= project.target_amount && project.target_amount > 0 }"
  >
     <!-- Header Card -->
     <div class="flex justify-between items-start mb-6">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" :class="project.color || 'bg-blue-500'">
           <Icon :name="project.icon || 'lucide:piggy-bank'" class="w-6 h-6" />
        </div>
        <div v-if="project.deadline" class="px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide" :class="getDeadlineBadge(project.deadline)?.class">
           {{ getDeadlineBadge(project.deadline)?.label }}
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button @click.stop="emit('history', project)" class="p-2 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-purple-600 transition-colors" title="Historique"><Icon name="lucide:history" class="w-4 h-4" /></button>
           <button 
             @click.stop="project.saved_amount < project.target_amount && emit('edit', project)" 
             class="p-2 rounded-lg transition-colors"
             :class="project.saved_amount >= project.target_amount ? 'text-ui-content-muted/30 cursor-not-allowed' : 'hover:bg-ui-surface-muted text-ui-content-muted hover:text-blue-600'"
             :disabled="project.saved_amount >= project.target_amount"
           ><Icon name="lucide:pencil" class="w-4 h-4" /></button>
           <button v-if="project.is_archived" @click.stop="emit('restore', project)" class="p-2 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-emerald-600 transition-colors" title="Restaurer"><Icon name="lucide:refresh-ccw" class="w-4 h-4" /></button>
           <button v-else @click.stop="emit('delete', project)" class="p-2 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-red-600 transition-colors"><Icon name="lucide:trash-2" class="w-4 h-4" /></button>
        </div>
     </div>

     <!-- Info -->
     <h3 class="text-lg font-black text-ui-content mb-1">{{ project.name }}</h3>
     <div class="flex items-baseline gap-1 mb-4">
        <span class="text-2xl font-black" :class="project.saved_amount >= project.target_amount ? 'text-emerald-600' : 'text-ui-content'">{{ project.saved_amount.toLocaleString('fr-FR') }} €</span>
        <span class="text-sm text-ui-content-muted font-medium">/ {{ project.target_amount.toLocaleString('fr-FR') }} €</span>
     </div>

     <!-- Progress -->
     <div class="h-3 w-full bg-ui-surface-muted rounded-full overflow-hidden mb-3">
        <div class="h-full rounded-full transition-all duration-1000" :class="project.color || 'bg-blue-500'" :style="{ width: `${Math.min((project.saved_amount / project.target_amount) * 100, 100)}%` }"></div>
     </div>

     <!-- Footer / Actions -->
     <div class="flex justify-between items-end mt-4">
        <div class="flex flex-col gap-1">
        <span class="text-ui-content-muted font-medium">{{ ((project.saved_amount / project.target_amount) * 100).toFixed(0) }}% atteint</span>
        <span v-if="getMonthlyEffort(project)" class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-fit">
           {{ getMonthlyEffort(project)?.amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) }} € {{ getMonthlyEffort(project)?.label }}
        </span>
        </div>
        <div class="flex gap-2" v-if="!project.is_archived">
            <button v-if="project.saved_amount >= project.target_amount" @click.stop="emit('archive', project)" class="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5" title="Archiver">
               <Icon name="lucide:archive" class="w-3 h-3" />
            </button>
            <button 
              @click.stop="project.saved_amount < project.target_amount && emit('transfer', project)" 
              class="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              :class="project.saved_amount >= project.target_amount ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20'"
              :disabled="project.saved_amount >= project.target_amount"
            >
              {{ project.saved_amount >= project.target_amount ? 'Gérer' : 'Verser' }} 
              <Icon :name="project.saved_amount >= project.target_amount ? 'lucide:settings-2' : 'lucide:plus'" class="w-3 h-3" />
            </button>
        </div>
     </div>
  </div>
</template>