<script setup lang="ts">
const route = useRoute()
// On récupère les infos dynamiques définies dans definePageMeta de chaque page
const slogan = computed(() => (route.meta.authSlogan as string) || 'Votre épargne prend son envol')
const icon = computed(() => (route.meta.authIcon as string) || 'lucide:snowflake')
</script>

<template>
  <div class="min-h-screen w-full lg:grid lg:grid-cols-[1fr_640px]">
    <!-- Zone d'information à gauche (Visible uniquement sur desktop) -->
    <div class="hidden lg:flex flex-col justify-center px-20 relative z-10">
      <div class="max-w-lg space-y-10">
        <div class="space-y-4">
          <h2 class="text-ui-content text-5xl font-black leading-tight">
            Pilotez votre épargne <br />
            <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">en toute simplicité.</span>
          </h2>
          <p class="text-ui-content-muted text-lg font-medium italic">Rejoignez la communauté Buddy'Air.</p>
        </div>

        <AuthFeatures />
      </div>
    </div>

    <aside class="auth-sidebar bg-ui-surface border-l border-ui-border flex flex-col justify-center p-8 sm:p-12 lg:p-20 overflow-y-auto h-full">
      <!-- En-tête commun (Fixe durant les transitions) -->
      <div class="flex items-center gap-5 mb-6">
        <img src="~/assets/images/buddyair.png" alt="BuddyAir Logo" class="w-20 h-20 object-contain drop-shadow-2xl" />
        <div class="flex flex-col">
          <h1 class="text-4xl font-black tracking-tighter text-ui-content leading-none">
            Buddy'<span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Air</span>
          </h1>
          <p class="mt-1.5 text-ui-content-muted text-[10px] font-bold uppercase tracking-[0.1em] min-h-[20px] flex items-center" v-html="slogan"></p>
        </div>
      </div>

      <!-- Séparation Design -->
      <div class="relative flex items-center mb-8">
        <div class="flex-grow border-t border-ui-border"></div>
        <div class="mx-4 text-ui-content-muted w-10 h-10 flex items-center justify-center shrink-0">
          <Transition name="icon-fade" mode="out-in">
            <Icon :key="icon" :name="icon" class="w-6 h-6" />
          </Transition>
        </div>
        <div class="flex-grow border-t border-ui-border"></div>
      </div>

      <!-- Contenu dynamique (Formulaires) -->
      <div>
        <slot />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s ease;
}
.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>