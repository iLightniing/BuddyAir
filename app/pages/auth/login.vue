<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({
  layout: 'auth',
  authSlogan: 'Votre <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">épargne</span> prend son envol',
  authIcon: 'lucide:snowflake'
})

const supabase = useSupabaseClient<Database>()
const { notify } = useNotification()
const loading = ref(false)
const form = ref({ email: '', password: '' })

const route = useRoute()
onMounted(() => {
  if (route.query.confirmed === 'true') {
    notify("Votre compte a été confirmé ! Vous pouvez maintenant vous connecter.", "success")
  }
})

const handleLogin = async () => {
  loading.value = true
  
  const { error } = await supabase.auth.signInWithPassword({
    email: form.value.email,
    password: form.value.password
  })

  if (error) {
    notify("Identifiants incorrects ou compte non confirmé.", "error")
    loading.value = false
  } else {
    // On marque la session comme active
    sessionStorage.setItem('buddyair_session_active', 'true')
    // On retourne le navigateTo pour stopper proprement le script
    return navigateTo('/dashboard', { replace: true })
  }
}

// Bloque les bulles d'erreur natives du navigateur
const handleInvalid = (e: Event) => {
  e.preventDefault()
}
</script>

<template>
  <div class="flex flex-col">
    <!-- novalidate désactive les bulles d'erreur natives du navigateur -->
    <form class="space-y-6" @submit.prevent="handleLogin" @invalid.capture="handleInvalid" novalidate>
      <UiInput v-model="form.email" label="Identifiant" type="email" placeholder="votre@email.com" required />

      <div class="space-y-2">
        <UiInput v-model="form.password" label="Mot de passe" type="password" placeholder="••••••••" required />
        <div class="flex justify-end px-1">
          <NuxtLink to="/auth/forgot-password" class="text-[10px] font-black text-slate-500 hover:text-blue-600 hover:underline transition-all uppercase tracking-widest cursor-pointer">
            Mot de passe oublié ?
          </NuxtLink>
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <UiButton type="submit" :disabled="loading" class="w-full py-4 shadow-xl shadow-blue-500/10">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </UiButton>
        <UiButton to="/auth/register" variant="secondary" class="w-full py-4">Créer un compte</UiButton>
      </div>
    </form>

    <AuthSocialLinks label="Ou continuer avec" />
  </div>
</template>