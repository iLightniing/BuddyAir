<script setup lang="ts">
const pb = usePocketBase()
const route = useRoute()
const { notify } = useNotification()

const handleConfirmation = async () => {
  const token = route.query.token as string
  const type = route.query.type as 'signup' | 'recovery' | 'oauth'

  if (!token && type !== 'oauth') {
    notify("Token de confirmation manquant.", "error")
    return navigateTo('/auth/login', { replace: true })
  }

  try {
    if (type === 'signup') {
      await pb.collection('users').confirmVerification(token)
      notify("Votre compte a été confirmé avec succès !", "success")
      return navigateTo('/auth/login?confirmed=true', { replace: true })
    }

    // Le 'confirmPasswordReset' est géré sur la page de mise à jour du mot de passe
    if (type === 'recovery') {
      // Stocker le token pour le réutiliser sur la page de réinitialisation
      sessionStorage.setItem('password_reset_token', token)
      return navigateTo('/auth/update-password', { replace: true })
    }

    // Gestion de la connexion OAuth
    if (type === 'oauth') {
      const user = usePocketBaseUser()
      if(user.value) {
        return navigateTo('/dashboard', { replace: true })
      }
    }

  } catch (error: any) {
    const errorMessage = error.message || "Une erreur est survenue lors de la confirmation."
    notify(errorMessage, "error")
    return navigateTo('/auth/login', { replace: true })
  }
}

onMounted(() => {
  // Erreurs potentielles d'OAuth
  const hasError = route.query.error || route.hash.includes('error_description')
  if (hasError) {
    notify("La connexion a été annulée ou a échoué.", "error")
    return navigateTo('/auth/login', { replace: true })
  }

  handleConfirmation()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen text-ui-content">
    <div class="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4"></div>
    <p class="text-sm font-bold uppercase tracking-widest opacity-70">Finalisation de la procédure...</p>
  </div>
</template>