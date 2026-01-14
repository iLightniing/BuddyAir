<script setup lang="ts">
const emit = defineEmits(['delete'])
</script>

<template>
  <div class="bg-red-50/50 border border-red-100 rounded-2xl p-6 shadow-sm h-fit">
     <h2 class="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Icon name="lucide:alert-triangle" class="w-4 h-4" /> Zone de danger
     </h2>
     <p class="text-xs text-red-800 mb-4">La suppression de votre compte est irréversible et entraînera la perte de toutes vos données.</p>
     <button @click="emit('delete')" class="w-full py-2.5 rounded-lg border border-red-200 bg-white text-red-600 text-xs font-bold hover:bg-red-50 transition-colors">
        Supprimer mon compte
     </button>
  </div>
</template>