<script setup lang="ts">
const props = defineProps({
  error: Object
})

const goBack = () => useRouter().back()
const clear = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ui-surface-muted text-ui-content font-sans">
    <!-- Background Image Layer (Cohérence avec app.vue) -->
    <div class="absolute inset-0 bg-app-wallpaper bg-cover bg-center blur-md scale-110 opacity-60"></div>

    <!-- Snow Effect Layer -->
    <ClientOnly>
      <UiParticles effect="snow" />
    </ClientOnly>

    <div class="relative z-20 flex flex-col items-center text-center p-12 bg-ui-surface border border-ui-border rounded-[2.5rem] shadow-2xl max-w-md w-full mx-4">
      <div class="mb-8 relative">
        <div class="absolute inset-0 blur-2xl bg-pink-500/20 rounded-full"></div>
        <Icon name="lucide:plane-landing" class="w-24 h-24 text-ui-content relative z-10" />
      </div>

      <h1 class="text-7xl font-black tracking-tighter mb-2">
        <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
          {{ error?.statusCode || '404' }}
        </span>
      </h1>
      
      <p class="text-lg font-medium text-ui-content-muted mb-10 italic">
        {{ error?.message || "Il semblerait que votre vol ait rencontré des turbulences." }}
      </p>

      <div class="flex flex-col w-full gap-4">
        <UiButton @click="goBack" class="w-full py-4 shadow-xl shadow-blue-500/10">
          <Icon name="lucide:undo-2" class="mr-2 w-5 h-5" />
          Retour en arrière
        </UiButton>
        
        <UiButton @click="clear" variant="secondary" class="w-full py-4">
          Page d'accueil
        </UiButton>
      </div>
    </div>
  </div>
</template>