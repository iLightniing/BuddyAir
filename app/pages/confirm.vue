<script setup lang="ts">
// Cette page gère la redirection après l'authentification Supabase (OAuth ou Email)
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()
const { notify } = useNotification()

// Gestion des erreurs ou annulations (ex: Google Cancel)
onMounted(() => {
  // Supabase renvoie les erreurs d'authentification dans l'URL (query ou hash)
  const hasError = route.query.error || route.hash.includes('error_description')
  
  if (hasError) {
    notify("La connexion a été annulée ou a échoué.", "error")
    return navigateTo('/auth/login')
  }

  // Sécurité : Si l'utilisateur est bloqué ici sans session après 5s (accès manuel ou bug)
  setTimeout(() => {
    if (!user.value) navigateTo('/auth/login')
  }, 5000)
})

watch(user, async () => {
  if (user.value) {
    // On récupère le type depuis la query string ou le hash (fallback client)
    let authType = (route.query.type as string) || ""
    
    if (!authType && import.meta.client) {
      authType = new URLSearchParams(window.location.hash.substring(1)).get('type') || ''
    }
    
    const isRecovery = authType === 'recovery' || route.hash.includes('type=recovery')
    const isSignup = authType === 'signup' || route.hash.includes('type=signup')

    if (isRecovery) {
      return navigateTo('/auth/update-password')
    }

    const provider = user.value.app_metadata?.provider

    if (provider === 'email' && isSignup) {
      // Cas 1 : Confirmation d'inscription par email -> on déconnecte pour forcer le premier login manuel
      await supabase.auth.signOut()
      return navigateTo('/auth/login?confirmed=true')
    } else {
      // Cas 2 : Connexion sociale (Google) -> l'utilisateur est déjà authentifié
      // On l'envoie directement sur son tableau de bord
      return navigateTo('/dashboard')
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen text-white">
    <div class="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4"></div>
    <p class="text-sm font-bold uppercase tracking-widest opacity-70">Finalisation de la connexion...</p>
  </div>
</template>