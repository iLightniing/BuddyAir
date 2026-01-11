<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({
  layout: 'auth',
  authSlogan: 'Sécurisez votre <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">accès</span>',
  authIcon: 'lucide:shield-check'
})

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { notify } = useNotification()
const loading = ref(false)
const password = ref('')
const confirmPassword = ref('')

const handleUpdate = async () => {
  if (password.value !== confirmPassword.value) {
    return notify("Les mots de passe ne correspondent pas.", "error")
  }

  loading.value = true
  const { error } = await supabase.auth.updateUser({
    password: password.value
  })

  if (error) {
    notify(error.message, "error")
    loading.value = false
  } else {
    notify("Mot de passe mis à jour ! Vous pouvez maintenant vous connecter.", "success")
    navigateTo('/auth/login')
  }
}

// Bloque les bulles d'erreur natives du navigateur
const handleInvalid = (e: Event) => {
  e.preventDefault()
}
</script>

<template>
  <div class="flex flex-col">
    <div v-if="user">
    <form class="space-y-6" @submit.prevent="handleUpdate" @invalid.capture="handleInvalid" novalidate>
      <p class="text-white/80 text-sm text-center mb-4 italic">
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
  </div>
</template>