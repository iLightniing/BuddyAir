<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  method: any
  isAdmin?: boolean
}>()

const emit = defineEmits(['delete', 'edit'])

const startEdit = () => {
    // Si c'est un mode système et qu'on n'est pas admin, on ne peut pas éditer (verrouillé)
    if (!props.isAdmin && props.method.is_system) return
    // Sinon, on demande l'ouverture de la modale
    emit('edit', props.method)
}
</script>

<template>
  <div class="p-3 flex items-center gap-3 transition-all group animate-in zoom-in-95 duration-300 relative overflow-hidden hover:bg-ui-surface-muted/30 border-b border-ui-border last:border-0">
    
    <!-- Drag Handle (Apparaît au survol à gauche) -->
    <div class="drag-handle cursor-grab active:cursor-grabbing text-ui-content-muted/20 hover:text-ui-content p-1 touch-none shrink-0 absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Icon name="lucide:grip-vertical" class="w-4 h-4" />
    </div>
    
    <!-- Visuel Carte (Icone stylisée) -->
    <div class="w-14 h-10 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-ui-border flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform duration-300 ml-6">
        <!-- Effet de brillance -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
        <!-- Puce décorative -->
        <div class="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/30"></div>
        
        <Icon :name="method.icon" class="w-5 h-5 text-ui-content relative z-10" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0 flex flex-col justify-center">
        <!-- Mode Affichage -->
        <div class="flex flex-col cursor-pointer group/title" @dblclick="startEdit">
            <div class="flex items-center gap-1.5">
                <span class="font-bold text-ui-content truncate select-none text-sm leading-tight" :title="method.name">{{ method.name }}</span>
                <Icon v-if="method.is_system && !isAdmin" name="lucide:lock" class="w-3 h-3 text-red-500 shrink-0" title="Mode système (Verrouillé)" />
                <span v-if="method.type === 'debit'" class="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1 rounded border border-red-100 ml-1">Débit</span>
                <span v-else-if="method.type === 'credit'" class="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100 ml-1">Crédit</span>
                <span v-else class="text-[9px] font-bold uppercase tracking-wider text-ui-content-muted bg-ui-surface-muted px-1 rounded border border-ui-border ml-1">Tout</span>
                
                <button v-if="isAdmin || !method.is_system" @click="startEdit" class="opacity-0 group-hover/title:opacity-100 text-ui-content-muted hover:text-blue-600 transition-opacity">
                    <Icon name="lucide:pen-line" class="w-3 h-3" />
                </button>
            </div>
            <!-- Faux numéro de carte / Code -->
            <span class="text-[10px] text-ui-content-muted font-mono tracking-wider opacity-60 truncate">
                {{ method.code ? method.code.toUpperCase() : '••••' }}
            </span>
        </div>
    </div>

    <!-- Actions (Absolute right) -->
    <div class="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            v-if="isAdmin || !method.is_system"
            @click="emit('delete', method)" 
            class="p-1.5 hover:bg-red-50 text-ui-content-muted hover:text-red-600 rounded-md transition-colors"
            title="Supprimer"
        >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
        </button>
    </div>
  </div>
</template>