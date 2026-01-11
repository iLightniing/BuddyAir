<script setup lang="ts">
// Cette page gère la redirection après l'authentification Supabase (OAuth ou Email)
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()
const { notify } = useNotification()
const isRedirecting = ref(false)

// Fonction de redirection logique
const handleRedirect = async () => {
  if (!user.value || isRedirecting.value) return
  isRedirecting.value = true

  // Extraction du type (signup, recovery, etc.) depuis Query ou Hash
  const hashParams = new URLSearchParams(route.hash.substring(1))
  const authType = hashParams.get('type') || route.query.type
  
  const isRecovery = authType === 'recovery'
  const isSignup = authType === 'signup'
  const provider = user.value.app_metadata?.provider

  if (isRecovery) {
    return navigateTo('/auth/update-password', { replace: true })
  }

  if (provider === 'email' && isSignup) {
    // Cas Inscription : on déconnecte pour forcer le login manuel
    await supabase.auth.signOut()
    return navigateTo('/auth/login?confirmed=true', { replace: true })
  }

  // Cas par défaut (Google login, etc.) : décollage immédiat
  return navigateTo('/dashboard', { replace: true })
}

// Gestion des erreurs ou annulations (ex: Google Cancel)
onMounted(() => {
  const hasError = route.query.error || route.hash.includes('error_description')
  
  if (hasError) {
    notify("La connexion a été annulée ou a échoué.", "error")
    return navigateTo('/auth/login', { replace: true })
  }
})

// Déclenchement de la redirection dès que l'utilisateur est chargé
watch(user, () => { if (user.value) handleRedirect() }, { immediate: true })
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen text-ui-content">
    <div class="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4"></div>
    <p class="text-sm font-bold uppercase tracking-widest opacity-70">Finalisation de la connexion...</p>
  </div>
</template>