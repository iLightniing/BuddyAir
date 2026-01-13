<script setup lang="ts">

definePageMeta({
  layout: 'auth',
  authSlogan: 'Rejoignez <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">l\'aventure</span>',
})

const pb = usePocketBase()

// État de la modale de traitement
const showModal = ref(false)
const modalStatus = ref<'processing' | 'success' | 'error'>('processing')
const modalProgress = ref(0)
const modalStep = ref('')
const modalMessage = ref('')

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  // Réinitialisation de l'état de la modale
  showModal.value = true
  modalStatus.value = 'processing'
  modalProgress.value = 0
  modalStep.value = 'Initialisation...'
  modalMessage.value = ''

  // Petit délai pour l'UX (laisser le temps de voir la modale s'ouvrir)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (form.value.password !== form.value.confirmPassword) {
    modalStatus.value = 'error'
    modalMessage.value = "Les mots de passe ne correspondent pas."
    return
  }

  try {
    modalProgress.value = 30
    modalStep.value = 'Création du profil utilisateur...'

    // 1. Inscription dans PocketBase (Collection 'users')
    // PocketBase requiert 'passwordConfirm' par défaut
    const data = {
      username: form.value.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 10000),
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      passwordConfirm: form.value.confirmPassword,
      role: 1, // 1 = Free, 2 = Premium, 3 = Admin
    }

    await pb.collection('users').create(data)
    
    modalProgress.value = 70
    modalStep.value = 'Envoi de l\'email de vérification...'

    // Demande explicite d'envoi de l'email de vérification
    await pb.collection('users').requestVerification(form.value.email)
    
    modalProgress.value = 100
    modalStatus.value = 'success'
    modalStep.value = 'Compte créé avec succès !'
    modalMessage.value = "Votre compte a été créé. Un email de confirmation vous a été envoyé. Pensez à vérifier vos spams !"
  } catch (e: any) {
    modalStatus.value = 'error'
    modalMessage.value = e.message || "Une erreur inconnue est survenue."
  }
}

// Empêche l'affichage des bulles d'erreur natives si le navigateur force quand même
const handleInvalid = (e: Event) => {
  e.preventDefault()
}

const closeModal = () => {
  showModal.value = false
  if (modalStatus.value === 'success') {
    navigateTo('/auth/login')
  }
}
</script>

<template>
  <div class="flex flex-col w-full max-w-sm mx-auto">
    <!-- Register Form -->
    <form class="space-y-2" @submit.prevent="handleRegister" @invalid.capture="handleInvalid" novalidate>
      <UiInput v-model="form.name" label="Nom d'utilisateur" placeholder="Buddy Aventurier" required />
      <UiInput v-model="form.email" label="Adresse Email" type="email" placeholder="votre@email.com" required />
      <UiInput v-model="form.password" label="Mot de passe" type="password" placeholder="••••••••" required />
      <UiInput v-model="form.confirmPassword" label="Confirmation" type="password" placeholder="••••••••" required />

      <div class="space-y-2 mt-5">
        <UiButton 
          type="submit" 
          class="w-full shadow-xl shadow-blue-500/10"
        >
          Créer mon compte
        </UiButton>
        <UiButton to="/auth/login" variant="secondary" class="w-full mt-2">Déjà inscrit ? Se connecter</UiButton>
      </div>
    </form>

    <AuthSocialLinks label="Ou s'inscrire avec" />

    <!-- Modale de traitement -->
    <UiModal :show="showModal">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 sm:p-6 rounded-xl shadow-2xl max-w-md w-full text-center">
        
        <!-- État : Traitement -->
        <div v-if="modalStatus === 'processing'" class="space-y-6 py-4">
          <div class="relative w-16 h-16 mx-auto">
            <div class="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Traitement en cours</h3>
            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div class="bg-blue-500 h-full transition-all duration-500 ease-out" :style="{ width: modalProgress + '%' }"></div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse">{{ modalStep }}</p>
          </div>
        </div>

        <!-- État : Succès -->
        <div v-else-if="modalStatus === 'success'" class="space-y-4 py-2">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lucide:check" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-green-600">Félicitations !</h3>
          <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
            <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {{ modalMessage }}
            </p>
          </div>
          <UiButton @click="closeModal" class="w-full mt-4 shadow-lg shadow-green-500/20" variant="primary">
            Aller à la connexion
          </UiButton>
        </div>

        <!-- État : Erreur -->
        <div v-else-if="modalStatus === 'error'" class="space-y-4 py-2">
          <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lucide:alert-triangle" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-red-600">Oups !</h3>
          <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
            <p class="text-slate-700 dark:text-slate-300 text-sm font-medium">
              {{ modalMessage }}
            </p>
          </div>
          <UiButton @click="showModal = false" variant="secondary" class="w-full mt-4">
            Fermer et corriger
          </UiButton>
        </div>

      </div>
    </UiModal>
  </div>
</template>