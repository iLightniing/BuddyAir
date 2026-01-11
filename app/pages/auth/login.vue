<script setup lang="ts">

definePageMeta({
  layout: 'auth',
  authSlogan: 'Votre <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">épargne</span> prend son envol',
  authIcon: 'lucide:snowflake'
})

const pb = usePocketBase()
const user = usePocketBaseUser()
const { notify } = useNotification()
const loading = ref(false)
const showLoadingModal = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('')

const form = ref({ email: '', password: '' })
const rememberMe = ref(true)

const route = useRoute()
onMounted(() => {
  if (route.query.confirmed === 'true') {
    notify("Votre compte a été confirmé ! Vous pouvez maintenant vous connecter.", "success")
  }

  // Redirection automatique si déjà connecté (Fix refresh)
  if (pb.authStore.isValid) {
    user.value = pb.authStore.model
    navigateTo('/dashboard', { replace: true })
  }
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const handleLogin = async () => {
  loading.value = true
  showLoadingModal.value = true
  loadingProgress.value = 0
  loadingStep.value = 'Préparation du décollage...'
  
  try {
    await sleep(600)
    loadingProgress.value = 30
    loadingStep.value = 'Vérification des identifiants...'

    await pb.collection('users').authWithPassword(form.value.email, form.value.password)
    
    loadingProgress.value = 60
    loadingStep.value = 'Chargement de votre espace...'
    await sleep(500)

    // Mise à jour explicite de l'état utilisateur pour que l'app sache qu'on est connecté
    if (pb.authStore.isValid) {
      user.value = pb.authStore.model
    }

    loadingProgress.value = 90
    loadingStep.value = 'Synchronisation des données...'
    await sleep(400)

    loadingProgress.value = 100
    
    // Gestion de la persistance
    // On active toujours la session courante pour éviter la déconnexion au refresh
    sessionStorage.setItem('buddyair_session_active', 'true')
    
    if (rememberMe.value) {
      localStorage.setItem('buddyair_session_active', 'true')
    } else {
      localStorage.removeItem('buddyair_session_active')
    }

    return navigateTo('/dashboard', { replace: true })
  } catch (error: any) {
    notify("Identifiants incorrects.", "error")
    loading.value = false
    showLoadingModal.value = false
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
        <div class="flex justify-between items-center px-1">
          <label class="flex items-center gap-2 cursor-pointer group">
            <div class="relative w-4 h-4 flex items-center justify-center">
              <input type="checkbox" v-model="rememberMe" class="peer appearance-none w-full h-full border border-slate-300 rounded bg-white checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer absolute inset-0" />
              <Icon name="lucide:check" class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-[3] relative z-10" />
            </div>
            <span class="text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Rester connecté</span>
          </label>
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

    <!-- Modal de chargement -->
    <UiModal :show="showLoadingModal">
      <div class="bg-ui-surface border border-ui-border p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
        <div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="lucide:plane" class="w-8 h-8 text-blue-500 animate-pulse" />
        </div>
        <h3 class="text-xl font-black text-ui-content mb-2">Connexion en cours</h3>
        <p class="text-sm text-ui-content-muted mb-8 h-5">{{ loadingStep }}</p>
        <div class="h-2 bg-ui-surface-muted rounded-full overflow-hidden border border-ui-border">
          <div class="h-full bg-linear-to-r from-blue-400 to-pink-400 transition-all duration-300 ease-out" :style="{ width: `${loadingProgress}%` }"></div>
        </div>
      </div>
    </UiModal>
  </div>
</template>