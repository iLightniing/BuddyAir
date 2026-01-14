<script setup lang="ts">
defineProps<{
  show: boolean
  user: any
  loading: boolean
}>()

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
    <UiModal :show="show" @close="emit('close')">
       <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full">
          <div class="flex items-center gap-4 mb-4">
             <div class="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <Icon name="lucide:triangle-alert" class="w-6 h-6" />
             </div>
             <h3 class="text-lg font-black text-ui-content">Suppression définitive</h3>
          </div>
          <p class="text-sm text-ui-content-muted mb-6">
             Vous êtes sur le point de supprimer votre compte <strong>{{ user?.email }}</strong>.<br>
             Toutes vos données (comptes, transactions, budgets) seront <strong>effacées définitivement</strong>.
          </p>
          <div class="flex gap-3">
             <UiButton @click="emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
             <UiButton @click="emit('confirm')" :loading="loading" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-lg shadow-red-500/20">Confirmer</UiButton>
          </div>
       </div>
    </UiModal>
</template>