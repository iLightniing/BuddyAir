<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({
  layout: 'auth',
  authSlogan: 'Rejoignez <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">l\'aventure</span>',
  authIcon: 'lucide:snowflake'
})

const supabase = useSupabaseClient<Database>()
const loading = ref(false)
const errorMsg = ref('')

// Configuration de la table (BuddyAir_local pour le dev)
const DB_TABLE = 'buddyair_local' as const

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  errorMsg.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = "Les mots de passe ne correspondent pas."
    return
  }

  loading.value = true
  
  try {
    // 1. Inscription dans Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: { username: form.value.username }
      }
    })

    if (error) throw error

    // 2. Création du profil dans ta table personnalisée
    if (data?.user) {
      const { error: dbError } = await supabase
        .from(DB_TABLE)
        .insert({
          id: data.user.id,
          username: form.value.username,
          email: form.value.email
        })
      
      if (dbError) throw dbError
      
      // Succès : Redirection vers le login (ou dashboard si auto-confirm activé)
      navigateTo('/auth/login')
    }
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

// Empêche l'affichage des bulles d'erreur natives si le navigateur force quand même
const handleInvalid = (e: Event) => {
  e.preventDefault()
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Register Form -->
    <form class="space-y-2" @submit.prevent="handleRegister" @invalid.capture="handleInvalid" novalidate>
      <UiInput v-model="form.username" label="Nom d'utilisateur" placeholder="Buddy_Aventurier" required />
      <UiInput v-model="form.email" label="Adresse Email" type="email" placeholder="votre@email.com" required />
      <UiInput v-model="form.password" label="Mot de passe" type="password" placeholder="••••••••" required />
      <UiInput v-model="form.confirmPassword" label="Confirmation" type="password" placeholder="••••••••" required />

      <p v-if="errorMsg" class="text-red-400 text-[10px] font-black uppercase tracking-wider px-1 mt-2">
        {{ errorMsg }}
      </p>

      <div class="space-y-2 mt-5">
        <UiButton 
          type="submit" 
          class="w-full shadow-xl shadow-blue-500/10"
          :disabled="loading"
        >
          {{ loading ? 'Traitement...' : 'Créer mon compte' }}
        </UiButton>
        <UiButton to="/auth/login" variant="secondary" class="w-full mt-2">Déjà inscrit ? Se connecter</UiButton>
      </div>
    </form>

    <AuthSocialLinks label="Ou s'inscrire avec" />
  </div>
</template>