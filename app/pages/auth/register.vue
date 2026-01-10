<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  authSlogan: 'Rejoignez <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">l\'aventure</span>',
  authIcon: 'lucide:user-plus'
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Register Form -->
    <form class="space-y-2" @submit.prevent>
      <UiInput label="Nom d'utilisateur" placeholder="Buddy_Aventurier" />
      <UiInput label="Adresse Email" type="email" placeholder="votre@email.com" />
      <UiInput label="Mot de passe" type="password" placeholder="••••••••" />
      <UiInput label="Confirmation" type="password" placeholder="••••••••" />

      <div class="space-y-2 mt-5">
        <UiButton class="w-full shadow-xl shadow-blue-500/10">
          Créer mon compte
        </UiButton>
        <UiButton to="/auth/login" variant="secondary" class="w-full mt-2">Déjà inscrit ? Se connecter</UiButton>
      </div>
    </form>

    <AuthSocialLinks label="Ou s'inscrire avec" />
  </div>
</template>