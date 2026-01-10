<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({
  layout: 'auth',
  authSlogan: 'Rejoignez <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">l\'aventure</span>',
  authIcon: 'lucide:user-plus'
})

const supabase = useSupabaseClient<Database>()
const loading = ref(false)
const { notify } = useNotification()

const showModal = ref(false)
const progress = ref(0)
const logs = ref<string[]>([])
const isComplete = ref(false)

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
}

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    notify("Les mots de passe ne correspondent pas.", "error")
    return
  }

  loading.value = true
  showModal.value = true
  progress.value = 10
  logs.value = ["Initialisation de l'inscription..."]
  
  try {
    await new Promise(r => setTimeout(r, 800))
    logs.value.push("Envoi des données d'authentification...")
    progress.value = 40

    // 1. Inscription dans Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: { username: form.value.username }
      }
    })

    if (error) throw error
    
    progress.value = 100
    resetForm()
    logs.value.push("Compte créé et profil synchronisé !")
    isComplete.value = true

  } catch (e: any) {
    logs.value.push(`ERREUR : ${e.message}`)
    notify(e.message, "error")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Register Form -->
    <form class="space-y-2" @submit.prevent="handleRegister">
      <UiInput v-model="form.username" label="Nom d'utilisateur" placeholder="Buddy_Aventurier" required />
      <UiInput v-model="form.email" label="Adresse Email" type="email" placeholder="votre@email.com" required />
      <UiInput v-model="form.password" label="Mot de passe" type="password" placeholder="••••••••" required />
      <UiInput v-model="form.confirmPassword" label="Confirmation" type="password" placeholder="••••••••" required />

      <div class="space-y-2 mt-3">
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

    <!-- Modal de progression -->
    <UiModal :show="showModal">
      <div class="w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
        <h3 class="text-white font-black uppercase tracking-widest text-center mb-6">Création du compte</h3>
        
        <!-- Barre de progression -->
        <div class="h-1.5 w-full bg-white/5 rounded-full mb-6 overflow-hidden">
          <div 
            class="h-full bg-linear-to-r from-blue-400 to-pink-400 transition-all duration-500"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <!-- Logs -->
        <div class="space-y-2 mb-8">
          <div v-for="(log, i) in logs" :key="i" class="text-[10px] font-mono text-white/50 flex gap-2">
            <span class="text-blue-400">></span> {{ log }}
          </div>
        </div>

        <!-- Message de confirmation mail -->
        <div v-if="isComplete" class="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl mb-6 animate-pulse">
          <p class="text-orange-300 text-[11px] font-bold text-center leading-relaxed">
            Un email de confirmation a été envoyé. Veuillez valider votre compte pour pouvoir décoller !
          </p>
        </div>

        <UiButton v-if="isComplete || logs.some(l => l.includes('ERREUR'))" @click="showModal = false" class="w-full">
          {{ isComplete ? 'Compris !' : 'Fermer' }}
        </UiButton>
      </div>
    </UiModal>
  </div>
</template>