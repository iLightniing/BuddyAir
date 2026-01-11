<template>
  <div class="flex min-h-screen">
    <!-- Sidebar fixe à gauche -->
    <DashboardSidebar />

    <!-- Zone de contenu (décalée de la largeur de la sidebar) -->
    <main class="flex-1 ml-20 p-8 lg:p-12">
      <slot />
    </main>
  </div>
</template>