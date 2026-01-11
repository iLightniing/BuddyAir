<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
      <div class="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
        <Icon name="lucide:log-out" class="w-8 h-8" />
      </div>
      
      <h3 class="text-white text-xl font-black uppercase tracking-tighter mb-2">Déconnexion</h3>
      <p class="text-white/60 text-sm mb-8 italic px-4">Prêt à atterrir ? Votre session sera fermée en toute sécurité.</p>
      
      <div class="flex gap-3">
        <UiButton @click="emit('close')" variant="secondary" class="flex-1">
          <Icon name="lucide:home" class="w-4 h-4" />
          Rester
        </UiButton>
        <UiButton @click="emit('confirm')" class="flex-1 !bg-red-500 hover:!bg-red-600 border-none">
          <Icon name="lucide:check" class="w-4 h-4" />
          Confirmer
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>