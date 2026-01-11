<template>
  <div class="flex min-h-screen">
    <!-- Sidebar fixe à gauche -->
    <DashboardSidebar />

    <div class="flex-1 flex flex-col ml-20">
      <!-- Header supérieur -->
      <DashboardHeader />

      <!-- Zone de contenu -->
      <main class="flex-1 p-8 lg:p-12">
        <slot />
      </main>
    </div>
  </div>
</template>