<script setup lang="ts">
const route = useRoute()
// On récupère les infos dynamiques définies dans definePageMeta de chaque page
const slogan = computed(() => (route.meta.authSlogan as string) || 'Votre épargne prend son envol')
const icon = computed(() => (route.meta.authIcon as string) || 'lucide:snowflake')

const isRegister = computed(() => route.path === '/auth/register')
</script>

<template>
  <!-- Zone d'information à gauche (Visible uniquement sur desktop) -->
  <div class="hidden lg:flex absolute inset-0 right-[640px] flex-col justify-center px-20 z-10">
    <div class="max-w-lg space-y-10">
      <div class="space-y-4">
        <h2 class="text-white text-5xl font-black leading-tight drop-shadow-2xl">
          Pilotez votre épargne <br />
          <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">en toute simplicité.</span>
        </h2>
        <p class="text-white/40 text-lg font-medium italic">Rejoignez la communauté Buddy'Air.</p>
      </div>

      <AuthFeatures />
    </div>
  </div>

  <aside class="auth-sidebar">
    <!-- En-tête commun (Fixe durant les transitions) -->
    <div :class="['flex items-center gap-5 transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1)', isRegister ? 'mb-2 -translate-y-6' : 'mb-6 -translate-y-4']">
      <img src="~/assets/images/buddyair.png" alt="BuddyAir Logo" class="w-20 h-20 object-contain drop-shadow-2xl" />
      <div class="flex flex-col">
        <h1 class="text-4xl font-black tracking-tighter text-white leading-none">
          Buddy'<span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Air</span>
        </h1>
        <p class="mt-1.5 text-white text-[10px] font-bold uppercase tracking-[0.1em] min-h-[20px] flex items-center" v-html="slogan"></p>
      </div>
    </div>

    <!-- Séparation Design -->
    <div :class="['relative flex items-center transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1)', isRegister ? 'mb-4 -translate-y-6' : 'mb-8']">
      <div class="flex-grow border-t border-white/10"></div>
      <div class="mx-4 text-white/60 w-10 h-10 flex items-center justify-center shrink-0">
        <Transition name="icon-fade" mode="out-in">
          <Icon :key="icon" :name="icon" class="w-6 h-6" />
        </Transition>
      </div>
      <div class="flex-grow border-t border-white/10"></div>
    </div>

    <!-- Contenu dynamique (Formulaires) -->
    <div :class="['transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1)', isRegister ? '-translate-y-6' : '']">
      <slot />
    </div>
  </aside>
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