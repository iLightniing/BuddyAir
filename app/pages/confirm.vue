<script setup lang="ts">
const pb = usePocketBase()
const route = useRoute()
const { notify } = useNotification()
const user = usePocketBaseUser()

const showErrorAndRedirect = (msg: string) => {
  notify(msg, "error")
  return navigateTo('/auth/login', { replace: true })
}

const handleConfirmation = async () => {
  const token = route.query.token as string
  const type = route.query.type as 'signup' | 'recovery' | 'oauth'

  if (!token && type !== 'oauth') {
    return showErrorAndRedirect("Token de confirmation manquant.")
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
      if(user.value) {
        return navigateTo('/dashboard', { replace: true })
      }
    }

  } catch (error: any) {
    return showErrorAndRedirect(error.message || "Une erreur est survenue lors de la confirmation.")
  }
}

onMounted(() => {
  // Erreurs potentielles d'OAuth
  const hasError = route.query.error || route.hash.includes('error_description')
  if (hasError) {
    return showErrorAndRedirect("La connexion a été annulée ou a échoué.")
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