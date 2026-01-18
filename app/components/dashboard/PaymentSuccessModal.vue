<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
      
      <!-- Effet de fond -->
      <div class="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none"></div>

      <div class="relative z-10">
        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-in zoom-in duration-500">
            <Icon name="lucide:party-popper" class="w-10 h-10" />
        </div>

        <h3 class="text-2xl font-black text-ui-content mb-2">Félicitations !</h3>
        <p class="text-ui-content-muted mb-8">
            Votre abonnement <strong>Premium</strong> est activé. Vous avez maintenant accès à toutes les fonctionnalités.
        </p>

        <UiButton @click="$emit('close')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
            C'est parti !
        </UiButton>
      </div>

    </div>
  </UiModal>
</template>