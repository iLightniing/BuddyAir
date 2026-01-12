<script setup lang="ts">

definePageMeta({
  layout: 'auth',
  authSlogan: 'Sécurisez votre <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">accès</span>',
  authIcon: 'lucide:snowflake'
})

const pb = usePocketBase()
const { notify } = useNotification()
const loading = ref(false)
const password = ref('')
const confirmPassword = ref('')
const token = ref<string | null>(null)

onMounted(() => {
  token.value = sessionStorage.getItem('password_reset_token')
  if (!token.value) {
    notify("Aucun token de réinitialisation trouvé. Veuillez refaire la demande.", "error")
    navigateTo('/auth/forgot-password', { replace: true })
  }
})

const handleUpdate = async () => {
  if (password.value !== confirmPassword.value) {
    return notify("Les mots de passe ne correspondent pas.", "error")
  }
  if (!token.value) {
    return notify("Token de réinitialisation invalide.", "error")
  }

  loading.value = true
  
  try {
    await pb.collection('users').confirmPasswordReset(
      token.value,
      password.value,
      confirmPassword.value
    )
    
    sessionStorage.removeItem('password_reset_token')
    notify("Mot de passe mis à jour ! Vous pouvez maintenant vous connecter.", "success")
    navigateTo('/auth/login', { replace: true })
  } catch (error: any) {
    notify(error.message || "Une erreur est survenue.", "error")
    loading.value = false
  }
}

// Bloque les bulles d'erreur natives du navigateur
const handleInvalid = (e: Event) => {
  e.preventDefault()
}
</script>

<template>
  <div class="flex flex-col w-full max-w-sm mx-auto">
    <form class="space-y-6" @submit.prevent="handleUpdate" @invalid.capture="handleInvalid" novalidate>
      <p class="text-slate-600 text-sm text-center mb-4 italic">
        Veuillez saisir votre nouveau mot de passe pour reprendre votre envol.
      </p>
      
      <UiInput v-model="password" label="Nouveau mot de passe" type="password" placeholder="••••••••" required />
      <UiInput v-model="confirmPassword" label="Confirmation" type="password" placeholder="••••••••" required />

      <div class="space-y-4 pt-4">
        <UiButton type="submit" :disabled="loading" class="w-full py-4 shadow-xl shadow-blue-500/10">
          {{ loading ? 'Mise à jour...' : 'Valider le nouveau mot de passe' }}
        </UiButton>
      </div>
    </form>
  </div>
</template>