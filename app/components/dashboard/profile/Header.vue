<script setup lang="ts">
import { useAvatarManager } from '~/composables/useAvatarManager'

const props = defineProps<{
  user: any
  loading: boolean
  isEditing: boolean
  userInitials: string
}>()

const emit = defineEmits(['startEdit', 'cancelEdit', 'save'])

const pb = usePocketBase()
const {
  fileInput, avatarPreview, isUploadingAvatar,
  triggerFileInput, handleAvatarChange
} = useAvatarManager()
</script>

<template>
    <div class="bg-ui-surface border border-ui-border rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
       <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
       
       <div class="relative group cursor-pointer" @click="triggerFileInput">
         <div class="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shrink-0 border-4 border-ui-surface overflow-hidden">
            <img v-if="avatarPreview || user?.avatar" :src="avatarPreview || pb.files.getURL(user!, user!.avatar)" class="w-full h-full object-cover" />
            <span v-else>{{ userInitials }}</span>
         </div>
         <div class="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon v-if="!isUploadingAvatar" name="lucide:camera" class="w-8 h-8 text-white" />
            <Icon v-else name="lucide:loader-2" class="w-8 h-8 text-white animate-spin" />
         </div>
         <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
       </div>
       
       <div class="flex-1 text-center md:text-left z-10">
          <h1 class="text-3xl font-black text-ui-content tracking-tight mb-1">{{ user?.name || 'Utilisateur' }}</h1>
          <p class="text-ui-content-muted font-medium flex items-center justify-center md:justify-start gap-2">
             <Icon name="lucide:mail" class="w-4 h-4" /> {{ user?.email }}
          </p>
          <div class="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
             <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                <Icon name="lucide:shield-check" class="w-3 h-3 mr-1.5" /> Compte Vérifié
             </span>
             <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                <Icon name="lucide:crown" class="w-3 h-3 mr-1.5" /> Membre Premium
             </span>
          </div>
       </div>

       <div class="flex flex-col gap-2 z-10">
          <template v-if="isEditing">
            <div class="flex gap-2">
               <UiButton @click="emit('cancelEdit')" variant="secondary">Annuler</UiButton>
               <UiButton @click="emit('save')" :disabled="loading" class="shadow-lg shadow-blue-500/20">
                 {{ loading ? 'Enregistrement...' : 'Sauvegarder' }}
               </UiButton>
            </div>
          </template>
          <UiButton v-else @click="emit('startEdit')" variant="secondary" class="border-ui-border bg-white hover:bg-ui-surface-muted">
            <Icon name="lucide:pencil" class="w-4 h-4 mr-2" /> Modifier mon profil
          </UiButton>
       </div>
    </div>
</template>