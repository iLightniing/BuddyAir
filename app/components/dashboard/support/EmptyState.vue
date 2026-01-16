<script setup lang="ts">
defineProps<{
  isAdmin?: boolean
}>()

defineEmits(['create'])
</script>

<template>
    <div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-ui-content-muted h-full">
        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Icon name="lucide:inbox" class="w-10 h-10 text-slate-400" />
        </div>
        <h3 class="text-xl font-bold text-ui-content mb-2">Sélectionnez un ticket</h3>
        <p class="max-w-xs mx-auto mb-8">Choisissez une conversation dans la liste de gauche pour voir les détails et répondre.</p>
        <UiButton v-if="!isAdmin" @click="$emit('create')" class="shadow-lg shadow-blue-500/20">Créer une demande</UiButton>
    </div>
</template>