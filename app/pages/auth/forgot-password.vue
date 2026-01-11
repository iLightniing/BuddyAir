<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  authSlogan: 'Récupération de <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">compte</span>',
  authIcon: 'lucide:snowflake'
})

const pb = usePocketBase()
const { notify } = useNotification()
const email = ref('')
const loading = ref(false)
const sent = ref(false)

const handleReset = async () => {
  loading.value = true
  try {
    await pb.collection('users').requestPasswordReset(email.value)
    sent.value = true
  } catch (error: any) {
    notify("Cette adresse email n'est pas reconnue.", "error")
  } finally {
    loading.value = false
  }
}

// Bloque les bulles d'erreur natives du navigateur
const handleInvalid = (e: Event) => {
  e.preventDefault()
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Forgot Password Form -->
    <form class="space-y-8" @submit.prevent="handleReset" @invalid.capture="handleInvalid" novalidate>
      <p class="text-slate-600 text-sm text-center mb-4 italic">
        {{ sent ? 'Un lien a été envoyé sur votre messagerie.' : 'Entrez votre adresse email pour recevoir un lien de réinitialisation.' }}
      </p>
      
      <UiInput v-if="!sent" v-model="email" label="Adresse Email" type="email" placeholder="votre@email.com" required />

      <div class="space-y-4 pt-4">
        <UiButton v-if="!sent" type="submit" :disabled="loading" class="w-full py-4 shadow-xl shadow-blue-500/10">
          {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
        </UiButton>
        <UiButton to="/auth/login" variant="secondary" class="w-full py-4">
          Retour à la connexion
        </UiButton>
      </div>
    </form>
  </div>
</template>