<script setup lang="ts">
defineProps<{
  show: boolean
  form: any
  loading: boolean
}>()

const emit = defineEmits(['close', 'submit'])
</script>

<template>
    <UiModal :show="show" @close="emit('close')">
       <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full">
          <div class="flex items-center justify-between mb-6">
             <h3 class="text-xl font-black text-ui-content">Modifier le mot de passe</h3>
             <button @click="emit('close')" class="text-ui-content-muted hover:text-ui-content transition-colors"><Icon name="lucide:x" class="w-5 h-5" /></button>
          </div>
          <form @submit.prevent="emit('submit')" class="space-y-5">
             <UiInput v-model="form.oldPassword" type="password" label="Ancien mot de passe" required />
             <div class="space-y-3">
                <UiInput v-model="form.password" type="password" label="Nouveau mot de passe" required />
                <UiInput v-model="form.passwordConfirm" type="password" label="Confirmer le nouveau mot de passe" required />
             </div>
             
             <div class="pt-4 flex gap-3">
                <UiButton type="button" @click="emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
                <UiButton type="submit" :disabled="loading" class="flex-1 shadow-lg shadow-blue-500/20">{{ loading ? '...' : 'Valider' }}</UiButton>
             </div>
          </form>
       </div>
    </UiModal>
</template>