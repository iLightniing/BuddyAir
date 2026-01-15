<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  method: any
  isAdmin?: boolean
}>()

const emit = defineEmits(['save', 'delete'])

const editing = ref<{ id: string, value: string } | null>(null)

const startEdit = () => {
    if (!props.isAdmin && props.method.is_global_source) return
    editing.value = { id: props.method.id || props.method.name, value: props.method.name }
}

const saveEdit = () => {
    if (!editing.value || !editing.value.value.trim()) return
    const updated = { ...props.method }
    updated.name = editing.value.value.trim()
    // On émet une copie propre
    emit('save', JSON.parse(JSON.stringify(updated)))
    editing.value = null
}

const cancelEdit = () => {
    editing.value = null
}
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-blue-300/30 transition-all group animate-in zoom-in-95 duration-300 relative overflow-hidden">
    
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
        <!-- Mode Édition -->
        <div v-if="editing" class="flex items-center gap-1 w-full">
            <input 
                v-model="editing.value" 
                @keydown.enter.prevent="saveEdit"
                @keydown.esc="cancelEdit"
                class="w-full bg-transparent border-b border-blue-500 px-0 py-0 text-sm font-bold focus:outline-none"
                autofocus
            />
            <button @click="saveEdit" class="text-green-600 hover:bg-green-50 p-0.5 rounded shrink-0"><Icon name="lucide:check" class="w-3 h-3" /></button>
            <button @click="cancelEdit" class="text-red-600 hover:bg-red-50 p-0.5 rounded shrink-0"><Icon name="lucide:x" class="w-3 h-3" /></button>
        </div>

        <!-- Mode Affichage -->
        <div v-else class="flex flex-col cursor-pointer group/title" @dblclick="startEdit">
            <div class="flex items-center gap-1.5">
                <span class="font-bold text-ui-content truncate select-none text-sm leading-tight" :title="method.name">{{ method.name }}</span>
                <Icon v-if="method.is_global_source" name="lucide:lock" class="w-3 h-3 text-red-500 shrink-0" title="Mode de base (Verrouillé)" />
                <button v-if="isAdmin || !method.is_global_source" @click="startEdit" class="opacity-0 group-hover/title:opacity-100 text-ui-content-muted hover:text-blue-600 transition-opacity">
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
    <div class="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" v-if="!editing">
        <button 
            v-if="isAdmin || !method.is_global_source"
            @click="emit('delete', method)" 
            class="p-1.5 hover:bg-red-50 text-ui-content-muted hover:text-red-600 rounded-md transition-colors"
            title="Supprimer"
        >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
        </button>
    </div>
  </div>
</template>