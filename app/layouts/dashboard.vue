<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen w-full">
    <!-- Sidebar fixe à gauche (Cachée sur mobile) -->
    <aside class="hidden md:block fixed inset-y-0 left-0 z-50">
      <DashboardSidebar />
    </aside>

    <div class="flex-1 flex flex-col md:ml-20 pb-20 md:pb-0 transition-all duration-300 min-w-0">
      <!-- Header supérieur -->
      <DashboardHeader />

      <!-- Zone de contenu -->
      <main class="flex-1 p-4 sm:p-6 lg:p-12">
        <slot />
      </main>
    </div>

    <!-- Navigation Mobile (Bottom Bar) -->
    <DashboardBottomNav />

    <!-- Global Command Palette -->
    <DashboardCommandPalette />
  </div>
</template>