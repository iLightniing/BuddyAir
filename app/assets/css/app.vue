<script setup lang="ts">
const route = useRoute()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - BuddyAir` : 'BuddyAir | Votre épargne prend son envol'
  }
})
</script>

<template>
  <div class="relative min-h-screen w-full bg-slate-950">
    <UiNotification />

    <!-- Background Image Layer (Immortel) -->
    <div class="fixed inset-0 bg-app-wallpaper bg-cover bg-center blur-md scale-110 opacity-60" style="z-index: 0;"></div>

    <!-- Snow Effect Layer (Immortel) -->
    <ClientOnly>
      <UiParticles effect="snow" style="z-index: 10;" />
    </ClientOnly>

    <main class="relative min-h-screen" style="z-index: 20;">
      <!-- On laisse Nuxt gérer la transition de layout naturellement -->
      <NuxtLayout>
        <!-- La page-key sur route.path permet des transitions fluides entre les pages -->
        <NuxtPage :page-key="route.path" />
      </NuxtLayout>
    </main>
  </div>
</template>
