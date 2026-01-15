<script setup lang="ts">
const user = usePocketBaseUser()
const refreshKey = ref(0)

const refreshPage = () => {
  refreshKey.value++
}
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

      <UiAnnouncementBanner />

      <!-- Zone de contenu -->
      <main class="flex-1 p-4 sm:p-6 lg:p-12">
        <div :key="refreshKey" class="h-full">
          <slot />
        </div>
      </main>
    </div>

    <!-- Bouton Refresh (Admin uniquement) -->
    <button 
      v-if="user?.role === 3"
      @click="refreshPage"
      class="fixed bottom-24 md:bottom-8 right-8 z-50 p-3 bg-ui-surface border border-ui-border rounded-full shadow-lg hover:shadow-xl hover:bg-ui-surface-muted text-ui-content-muted hover:text-ui-content transition-all group"
      title="Rafraîchir la page"
    >
      <Icon name="lucide:refresh-cw" class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
    </button>

    <!-- Navigation Mobile (Bottom Bar) -->
    <DashboardBottomNav />

    <!-- Global Command Palette -->
    <DashboardCommandPalette />
  </div>
</template>