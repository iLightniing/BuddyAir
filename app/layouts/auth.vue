<script setup lang="ts">
const route = useRoute()
// On récupère les infos dynamiques définies dans definePageMeta de chaque page
const slogan = computed(() => (route.meta.authSlogan as string) || 'Votre épargne prend son envol')
const icon = computed(() => (route.meta.authIcon as string) || 'lucide:snowflake')

const isRegister = computed(() => route.path === '/auth/register')
</script>

<template>
  <aside class="auth-sidebar">
    <!-- En-tête commun (Fixe durant les transitions) -->
    <div :class="['flex items-center gap-5 transition-all duration-700 ease-in-out', isRegister ? 'mb-2 -translate-y-6' : 'mb-6 -translate-y-4']">
      <img src="~/assets/images/buddyair.png" alt="BuddyAir Logo" class="w-20 h-20 object-contain drop-shadow-2xl" />
      <div class="flex flex-col">
        <h1 class="text-4xl font-black tracking-tighter text-white leading-none">
          Buddy'<span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Air</span>
        </h1>
        <p class="mt-1.5 text-white text-[10px] font-bold uppercase tracking-[0.1em] min-h-[20px] flex items-center" v-html="slogan"></p>
      </div>
    </div>

    <!-- Séparation Design -->
    <div :class="['relative flex items-center transition-all duration-700 ease-in-out', isRegister ? 'mb-4 -translate-y-6' : 'mb-8']">
      <div class="flex-grow border-t border-white/10"></div>
      <div class="mx-4 text-white/60 w-10 h-10 flex items-center justify-center shrink-0">
        <Icon :name="icon" class="w-6 h-6" />
      </div>
      <div class="flex-grow border-t border-white/10"></div>
    </div>

    <!-- Contenu dynamique (Formulaires) -->
    <div :class="['transition-all duration-700 ease-in-out', isRegister ? '-translate-y-6' : '']">
      <slot />
    </div>
  </aside>
</template>