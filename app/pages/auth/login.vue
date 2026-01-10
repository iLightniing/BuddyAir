<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  authSlogan: 'Votre <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">épargne</span> prend son envol',
  authIcon: 'lucide:snowflake'
})
</script>

<template>
  <div class="flex flex-col">
    <form class="space-y-6" @submit.prevent>
      <UiInput label="Identifiant" type="email" placeholder="Email ou nom d'utilisateur" />

      <div class="space-y-2">
        <UiInput label="Mot de passe" type="password" placeholder="••••••••" />
        <div class="flex justify-end px-1">
          <NuxtLink to="/auth/forgot-password" class="text-[10px] font-black text-white/40 hover:text-white hover:underline transition-all uppercase tracking-widest cursor-pointer">
            Mot de passe oublié ?
          </NuxtLink>
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <UiButton class="w-full py-4 shadow-xl shadow-blue-500/10">Se connecter</UiButton>
        <UiButton to="/auth/register" variant="secondary" class="w-full py-4">Créer un compte</UiButton>
      </div>
    </form>

    <AuthSocialLinks label="Ou continuer avec" />
  </div>
</template>