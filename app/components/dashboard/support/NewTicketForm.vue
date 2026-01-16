<script setup lang="ts">
import { SUPPORT_CATEGORIES_OPTIONS } from '~/utils/supportConstants'

defineProps<{
  sending: boolean
}>()

const emit = defineEmits(['cancel', 'create'])

const form = ref({
  subject: '',
  category: 'bug',
  content: ''
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const onSubmit = () => {
    emit('create', form.value, selectedFiles.value)
}
</script>

<template>
    <div class="flex-1 flex flex-col h-full">
        <div class="p-6 border-b border-ui-border flex items-center gap-4">
            <button @click="$emit('cancel')" class="md:hidden p-2 -ml-2 text-ui-content-muted"><Icon name="lucide:arrow-left" class="w-5 h-5" /></button>
            <h2 class="text-xl font-black text-ui-content">Nouvelle demande</h2>
        </div>
        <div class="p-6 max-w-2xl mx-auto w-full space-y-6 overflow-y-auto">
            <div class="space-y-2">
                <label class="text-sm font-bold text-ui-content">Sujet</label>
                <input v-model="form.subject" type="text" class="w-full bg-ui-surface border border-ui-border rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors" placeholder="Ex: Problème de synchronisation..." />
            </div>

            <div class="space-y-2">
                <label class="text-sm font-bold text-ui-content">Catégorie</label>
                <div class="grid grid-cols-2 gap-3">
                    <button 
                        v-for="cat in SUPPORT_CATEGORIES_OPTIONS" 
                        :key="cat.value"
                        @click="form.category = cat.value"
                        class="p-3 rounded-xl border text-left flex items-center gap-3 transition-all"
                        :class="form.category === cat.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-ui-border hover:border-blue-300 text-ui-content-muted'"
                    >
                        <Icon :name="cat.icon" class="w-5 h-5" />
                        <span class="text-sm font-medium">{{ cat.label }}</span>
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-bold text-ui-content">Message</label>
                <textarea v-model="form.content" rows="8" class="w-full bg-ui-surface border border-ui-border rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors resize-none" placeholder="Décrivez votre demande en détail..."></textarea>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-bold text-ui-content">Pièces jointes (Optionnel)</label>
                <div class="flex items-center gap-4">
                    <button @click="fileInput?.click()" class="flex items-center gap-2 px-4 py-2 bg-ui-surface border border-ui-border rounded-xl text-sm font-medium text-ui-content hover:bg-ui-surface-muted transition-colors">
                        <Icon name="lucide:paperclip" class="w-4 h-4" />
                        Ajouter des fichiers
                    </button>
                    <input type="file" ref="fileInput" multiple accept="image/*" class="hidden" @change="handleFileSelect" />
                    <span v-if="selectedFiles.length > 0" class="text-xs text-ui-content-muted">{{ selectedFiles.length }} fichier(s) sélectionné(s)</span>
                </div>
                <!-- Preview Files -->
                <div v-if="selectedFiles.length > 0" class="flex gap-2 mt-3 overflow-x-auto pb-2">
                    <div v-for="(file, index) in selectedFiles" :key="index" class="relative shrink-0">
                        <div class="w-16 h-16 bg-slate-100 rounded-lg border border-ui-border flex items-center justify-center overflow-hidden">
                            <Icon name="lucide:image" class="w-6 h-6 text-slate-400" />
                        </div>
                        <button @click="selectedFiles.splice(index, 1)" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform">
                            <Icon name="lucide:x" class="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <UiButton @click="onSubmit" :loading="sending" class="px-8 py-3 shadow-xl shadow-blue-500/20">Envoyer la demande</UiButton>
            </div>
        </div>
    </div>
</template>