<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - BuddyAir` : 'BuddyAir | Votre épargne prend son envol'
  }
})
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-slate-950">
    <!-- Background Image Layer (Immortel) -->
    <div class="absolute inset-0 bg-app-wallpaper bg-cover bg-center blur-md scale-110 opacity-60"></div>

    <!-- Snow Effect Layer (Immortel) -->
    <ClientOnly>
      <UiParticles effect="snow" />
    </ClientOnly>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
