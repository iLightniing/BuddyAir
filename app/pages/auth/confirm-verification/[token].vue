<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'Vérification du compte'
})

const route = useRoute()
const router = useRouter()
const pb = usePocketBase()
const { notify } = useNotification()

const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.params.token as string
  
  if (!token) {
    error.value = "Jeton de vérification manquant."
    loading.value = false
    return
  }

  try {
    // Appel à PocketBase pour valider le token
    await pb.collection('users').confirmVerification(token)
    
    success.value = true
    notify('Votre compte a été vérifié avec succès !', 'success')
    
    // Redirection automatique après 3 secondes
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  } catch (e: any) {
    console.error(e)
    error.value = "Ce lien est invalide ou a expiré."
    notify('Échec de la vérification', 'error')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-ui-surface-muted p-4">
    <div class="w-full max-w-md bg-ui-surface border border-ui-border rounded-2xl shadow-xl p-8 text-center">
      
      <!-- Chargement -->
      <div v-if="loading" class="py-8">
        <Icon name="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 class="text-xl font-bold text-ui-content">Vérification en cours...</h2>
        <p class="text-ui-content-muted mt-2">Veuillez patienter un instant.</p>
      </div>

      <!-- Succès -->
      <div v-else-if="success" class="py-8 animate-in zoom-in-95 duration-300">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="lucide:check" class="w-8 h-8" />
        </div>
        <h2 class="text-2xl font-black text-ui-content mb-2">Compte vérifié !</h2>
        <p class="text-ui-content-muted mb-8">Bienvenue sur BuddyAir. Vous allez être redirigé vers la page de connexion.</p>
        <UiButton @click="router.push('/auth/login')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          Se connecter maintenant
        </UiButton>
      </div>

      <!-- Erreur -->
      <div v-else class="py-8 animate-in shake duration-300">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="lucide:x" class="w-8 h-8" />
        </div>
        <h2 class="text-2xl font-black text-ui-content mb-2">Lien invalide</h2>
        <p class="text-red-600 font-medium mb-8">{{ error }}</p>
        <UiButton @click="router.push('/auth/login')" variant="secondary" class="w-full">
          Retour à la connexion
        </UiButton>
      </div>

    </div>
  </div>
</template>