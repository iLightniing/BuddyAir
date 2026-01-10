<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  authSlogan: 'Récupération de <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">compte</span>',
  authIcon: 'lucide:key-round'
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Forgot Password Form -->
    <form class="space-y-8" @submit.prevent>
      <p class="text-white/80 text-sm text-center mb-4 italic">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
      
      <UiInput label="Adresse Email" type="email" placeholder="votre@email.com" />

      <div class="space-y-4 pt-4">
        <UiButton class="w-full py-4 shadow-xl shadow-blue-500/10">
          Envoyer le lien
        </UiButton>
        <UiButton to="/auth/login" variant="secondary" class="w-full py-4">
          Retour à la connexion
        </UiButton>
      </div>
    </form>
  </div>
</template>