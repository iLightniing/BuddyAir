<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps<{
  category: any
  isAdmin?: boolean
}>()

const emit = defineEmits(['save', 'delete'])

// États locaux pour l'édition
const newSubCategory = ref('')
const editingCat = ref<{ id: string, value: string } | null>(null)
const editingSub = ref<{ index: number, value: string } | null>(null)

// --- Helpers ---
const isSubLocked = (subName: string) => {
    // En mode admin, rien n'est verrouillé. En mode user, on vérifie locked_subs.
    if (props.isAdmin) return false
    return props.category.locked_subs && props.category.locked_subs.includes(subName)
}

// --- Actions ---
const onSave = (updatedCategory: any) => {
    // On émet une copie propre pour éviter les mutations directes de props qui se propagent mal
    emit('save', JSON.parse(JSON.stringify(updatedCategory)))
}

// Ajout Sous-catégorie
const addSubCategory = () => {
    if (!newSubCategory.value.trim()) return
    const updated = { ...props.category }
    if (!updated.sub_categories) updated.sub_categories = []
    updated.sub_categories.push(newSubCategory.value.trim())
    onSave(updated)
    newSubCategory.value = ''
}

// Suppression Sous-catégorie
const removeSubCategory = (index: number) => {
    const updated = { ...props.category }
    updated.sub_categories.splice(index, 1)
    onSave(updated)
}

// Réordonnancement
const onOrderChange = () => {
    // VueDraggable a déjà muté le tableau local (props.category.sub_categories via v-model)
    // On déclenche juste la sauvegarde
    onSave(props.category)
}

// Édition Titre
const startEditCat = () => {
    if (!props.isAdmin && props.category.is_global_source) return
    editingCat.value = { id: props.category.id || props.category.name, value: props.category.name }
}
const saveEditCat = () => {
    if (!editingCat.value || !editingCat.value.value.trim()) return
    const updated = { ...props.category }
    updated.name = editingCat.value.value.trim()
    onSave(updated)
    editingCat.value = null
}

// Édition Sous-catégorie
const startEditSub = (index: number, val: string) => {
    if (isSubLocked(val)) return
    editingSub.value = { index, value: val }
}
const saveEditSub = () => {
    if (!editingSub.value || !editingSub.value.value.trim()) return
    const updated = { ...props.category }
    updated.sub_categories[editingSub.value.index] = editingSub.value.value.trim()
    onSave(updated)
    editingSub.value = null
}
const cancelEdit = () => {
    editingCat.value = null
    editingSub.value = null
}
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-xl flex flex-col shadow-sm hover:shadow-md transition-all group animate-in zoom-in-95 duration-300">
    <!-- Header Carte -->
    <div class="p-3 border-b border-ui-border flex items-center justify-between bg-ui-surface-muted/30 rounded-t-xl">
      <div class="flex items-center gap-2 overflow-hidden w-full">
        <div class="drag-handle-cat cursor-grab active:cursor-grabbing text-ui-content-muted hover:text-ui-content p-1 touch-none shrink-0">
          <Icon name="lucide:grip-vertical" class="w-4 h-4" />
        </div>
        
        <!-- Édition Titre Catégorie -->
        <div v-if="editingCat" class="flex items-center gap-1 w-full mr-2">
            <input 
                v-model="editingCat.value" 
                @keydown.enter.prevent="saveEditCat"
                @keydown.esc="cancelEdit"
                class="w-full bg-white border border-blue-300 rounded px-2 py-0.5 text-sm font-bold focus:border-blue-500 outline-none min-w-0"
                autofocus
            />
            <button @click="saveEditCat" class="text-green-600 hover:bg-green-50 p-1 rounded shrink-0"><Icon name="lucide:check" class="w-3 h-3" /></button>
            <button @click="cancelEdit" class="text-red-600 hover:bg-red-50 p-1 rounded shrink-0"><Icon name="lucide:x" class="w-3 h-3" /></button>
        </div>
        <div v-else class="flex items-center gap-2 overflow-hidden cursor-pointer w-full" @dblclick="startEditCat">
            <span class="font-bold text-ui-content truncate select-none flex items-center gap-2" :title="category.name">
                {{ category.name }}
                <Icon v-if="category.is_global_source" name="lucide:lock" class="w-3 h-3 text-red-500 shrink-0" title="Catégorie de base (Verrouillée)" />
            </span>
        </div>
      </div>
      
      <!-- Actions Header -->
      <div class="flex gap-1 shrink-0" v-if="!editingCat">
        <button v-if="isAdmin || !category.is_global_source" @click="startEditCat" class="p-1.5 hover:bg-blue-50 text-ui-content-muted hover:text-blue-600 rounded-md transition-colors" title="Modifier le nom">
            <Icon name="lucide:pen-line" class="w-4 h-4" />
        </button>

        <!-- Bouton Supprimer : Désactivé si Global Source en mode User -->
        <button 
            v-if="isAdmin || !category.is_global_source"
            @click="emit('delete', category)" 
            class="p-1.5 hover:bg-red-50 text-ui-content-muted hover:text-red-600 rounded-md transition-colors" 
            title="Supprimer la catégorie"
        >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Liste Sous-catégories -->
    <div class="p-3 flex-1 flex flex-col gap-2">
        <VueDraggable 
            v-model="category.sub_categories" 
            group="sub-categories"
            :animation="300"
            handle=".drag-handle-sub"
            @end="onOrderChange"
            class="space-y-1 min-h-[10px]"
        >
            <div v-for="(sub, index) in category.sub_categories" :key="sub" class="flex items-center justify-between group/sub p-2 rounded-lg hover:bg-ui-surface-muted border border-transparent hover:border-ui-border transition-colors text-sm">
                <!-- Mode Édition Sous-catégorie -->
                <div v-if="editingSub && editingSub.index === index" class="flex items-center gap-2 w-full">
                    <input 
                        v-model="editingSub.value" 
                        @keydown.enter.prevent="saveEditSub"
                        @keydown.esc="cancelEdit"
                        class="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                        autofocus
                    />
                    <button @click="saveEditSub" class="text-green-600 hover:bg-green-50 p-1 rounded shrink-0"><Icon name="lucide:check" class="w-3 h-3" /></button>
                    <button @click="cancelEdit" class="text-red-600 hover:bg-red-50 p-1 rounded shrink-0"><Icon name="lucide:x" class="w-3 h-3" /></button>
                </div>

                <!-- Mode Affichage -->
                <template v-else>
                    <div class="flex items-center gap-2 overflow-hidden w-full">
                        <div class="drag-handle-sub cursor-grab active:cursor-grabbing text-ui-content-muted/50 hover:text-ui-content-muted opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                            <Icon name="lucide:grip-vertical" class="w-3 h-3" />
                        </div>

                        <span class="text-ui-content truncate select-none flex items-center gap-2" :class="{'text-ui-content-muted': isSubLocked(sub)}">
                            {{ sub }}
                            <Icon v-if="isSubLocked(sub)" name="lucide:lock" class="w-3 h-3 text-red-500 shrink-0" title="Sous-catégorie de base (Verrouillée)" />
                        </span>
                    </div>
                    
                    <div class="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                        <!-- Edit Sub : Désactivé si verrouillée -->
                        <button v-if="!isSubLocked(sub)" @click="startEditSub(index as number, sub)" class="text-ui-content-muted hover:text-blue-600 p-1 rounded hover:bg-blue-50">
                            <Icon name="lucide:pen-line" class="w-3 h-3" />
                        </button>
                        <!-- Delete Sub : Désactivé si verrouillée -->
                        <button v-if="!isSubLocked(sub)" @click="removeSubCategory(index as number)" class="text-ui-content-muted hover:text-red-600 p-1 rounded hover:bg-red-50">
                            <Icon name="lucide:x" class="w-3 h-3" />
                        </button>
                    </div>
                </template>
            </div>
        </VueDraggable>

        <div v-if="!category.sub_categories || category.sub_categories.length === 0" class="text-xs text-ui-content-muted italic p-2 text-center bg-ui-surface-muted/20 rounded-lg border border-dashed border-ui-border/50">
            Aucune sous-catégorie actuellement
        </div>
        
        <!-- Input Ajout Rapide -->
        <div class="mt-2 relative">
            <input 
                v-model="newSubCategory" 
                @keydown.enter.prevent="addSubCategory"
                placeholder="+ Ajouter..." 
                class="w-full bg-transparent border border-dashed border-ui-border hover:border-blue-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:border-solid outline-none transition-all placeholder:text-ui-content-muted/70"
            />
            <button 
                v-if="newSubCategory"
                @click="addSubCategory" 
                class="absolute right-2 top-1.5 text-blue-600 hover:text-blue-700"
            >
                <Icon name="lucide:arrow-right" class="w-4 h-4" />
            </button>
        </div>
    </div>
  </div>
</template>