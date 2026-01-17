<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Paiement réussi'
})

const route = useRoute()
const pb = usePocketBase()
const user = usePocketBaseUser()
const loading = ref(true)
const returnUrl = computed(() => (route.query.from as string) || '/dashboard')

onMounted(async () => {
  // On force le rafraîchissement des données utilisateur pour récupérer le nouveau rôle
  // Le webhook Stripe peut prendre quelques secondes, donc on fait une petite pause
  setTimeout(async () => {
    if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh()
          user.value = pb.authStore.model
        } catch (e) {
          console.error("Erreur refresh:", e)
        }
    }
    loading.value = false
  }, 2000)
})
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center p-4">
    
    <div class="bg-ui-surface border border-ui-border rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden">
      <!-- Effet de fond -->
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative">
        <div class="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-white animate-in zoom-in duration-500">
          <Icon name="lucide:check" class="w-12 h-12 drop-shadow-sm" />
        </div>
        
        <h1 class="text-3xl font-black text-ui-content mb-3 tracking-tight">Félicitations !</h1>
        <p class="text-ui-content-muted mb-8 text-lg leading-relaxed">
          Votre abonnement <strong>Premium</strong> est maintenant actif. Merci de votre confiance.
        </p>

        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-4 bg-ui-surface-muted/50 rounded-xl mb-6 animate-pulse">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-emerald-600" />
            <span class="text-sm font-medium text-ui-content-muted">Finalisation de l'activation...</span>
        </div>

        <div v-else class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <UiButton :to="returnUrl" class="w-full py-4 text-base font-bold shadow-xl shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-none text-white transition-all hover:scale-[1.02]">
            Continuer vers BuddyAir
            <Icon name="lucide:arrow-right" class="ml-2 w-5 h-5" />
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>