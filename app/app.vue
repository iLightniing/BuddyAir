<script setup lang="ts">
const route = useRoute()

useHead({
  title: computed(() => route.meta.title as string),
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - BuddyAir` : 'BuddyAir | Votre épargne prend son envol'
  }
})
</script>

<template>
  <div class="relative min-h-screen w-full bg-ui-surface-muted transition-colors duration-500">
    <UiNotification />

    <!-- Background Image Layer (Immortel) -->
    <div class="fixed inset-0 bg-app-wallpaper bg-cover bg-center blur-md scale-110 opacity-60 z-0"></div>

    <!-- Snow Effect Layer (Immortel) -->
    <ClientOnly>
      <UiParticles effect="snow" class="z-10" />
    </ClientOnly>

    <main class="relative min-h-screen z-20">
      <NuxtLayout>
        <!-- La page-key garantit que la transition se déclenche à chaque changement de route -->
        <NuxtPage :page-key="route.path" />
      </NuxtLayout>
    </main>
  </div>
</template>
