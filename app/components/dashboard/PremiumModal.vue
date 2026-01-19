<!-- app/components/dashboard/PremiumModal.vue -->
<script setup lang="ts">
const { showPremiumModal } = usePremium()
const user = usePocketBaseUser()
const route = useRoute()
const config = useRuntimeConfig()
const { notify } = useNotification()
const loading = ref(false)
const selectedPlan = ref<'monthly' | 'yearly'>('yearly') // Annuel par défaut (Upsell)
const showEmbeddedCheckout = ref(false)

// Réinitialiser l'état quand on ferme la modale
watch(showPremiumModal, (isOpen) => {
  if (!isOpen) {
    // Petit délai pour laisser l'animation de fermeture se terminer proprement
    setTimeout(() => {
      showEmbeddedCheckout.value = false
      loading.value = false
    }, 300)
  }
})

// Chargeur dynamique du SDK Stripe (évite d'installer @stripe/stripe-js)
const loadStripeSdk = () => {
    return new Promise((resolve) => {
        if ((window as any).Stripe) return resolve((window as any).Stripe)
        const script = document.createElement('script')
        script.src = 'https://js.stripe.com/v3/'
        script.onload = () => resolve((window as any).Stripe)
        document.head.appendChild(script)
    })
}

const handleSubscribe = async () => {
  if (!user.value) return
  loading.value = true
  try {
    // On demande une session "embedded"
    const response = await $fetch<{ url: string, clientSecret: string }>('/api/stripe/checkout', {
      method: 'POST',
      body: {
        userId: user.value.id,
        email: user.value.email,
        plan: selectedPlan.value,
        returnUrl: route.fullPath,
        embedded: true // Active le mode intégré
      }
    })

    if (response.clientSecret && config.public.stripeKey) {
      // Mode Intégré
      showEmbeddedCheckout.value = true
      const StripeConstructor: any = await loadStripeSdk()
      const stripe = StripeConstructor(config.public.stripeKey)
      
      // Initialisation du checkout intégré
      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret: response.clientSecret,
      })
      
      // Montage dans la div #checkout-element
      checkout.mount('#checkout-element')
    } else if (response.url) {
      // Fallback redirection si pas de clé publique ou erreur
      navigateTo(response.url, { external: true })
    }
  } catch (e: any) {
    console.error(e)
    notify(e.data?.statusMessage || "Une erreur est survenue lors de la redirection vers le paiement.", "error")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UiModal :show="showPremiumModal" @close="showPremiumModal = false">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full text-center transition-all duration-500 max-h-[90vh] overflow-y-auto" :class="showEmbeddedCheckout ? 'max-w-2xl' : 'max-w-md'">
      
      <!-- Zone Checkout Intégré -->
      <div v-if="showEmbeddedCheckout" id="checkout-element" class="min-h-[400px]"></div>

      <!-- Contenu Marketing (Masqué si checkout actif) -->
      <div v-else>
      <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Icon name="lucide:crown" class="w-8 h-8" />
      </div>
      <h3 class="text-xl font-black text-ui-content mb-2">Fonctionnalité Premium</h3>
      <p class="text-ui-content-muted mb-6 text-sm">
        Passez à la vitesse supérieure et débloquez tout le potentiel de BuddyAir.
      </p>

      <ul class="text-left text-sm space-y-3 mb-8 bg-ui-surface-muted/50 p-5 rounded-xl border border-ui-border">
        <li class="flex items-start gap-3 text-ui-content">
            <Icon name="lucide:check-circle-2" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Échéances automatiques</strong> : Fini la saisie manuelle chaque mois.</span>
        </li>
        <li class="flex items-start gap-3 text-ui-content">
            <Icon name="lucide:check-circle-2" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Comptes Crédit & Emprunts</strong> : Suivez votre capital restant dû.</span>
        </li>
        <li class="flex items-start gap-3 text-ui-content">
            <Icon name="lucide:check-circle-2" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Support prioritaire</strong> : Une réponse plus rapide à vos demandes.</span>
        </li>
      </ul>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div 
            @click="selectedPlan = 'monthly'"
            class="border rounded-xl p-4 transition-all cursor-pointer bg-white relative"
            :class="selectedPlan === 'monthly' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-ui-border hover:border-blue-300'"
        >
            <div class="text-xs font-bold text-ui-content-muted uppercase tracking-wider mb-1">Mensuel</div>
            <div class="text-2xl font-black text-ui-content">2 €<span class="text-sm font-normal text-ui-content-muted">/mois</span></div>
        </div>
        <div 
            @click="selectedPlan = 'yearly'"
            class="border-2 rounded-xl p-4 relative cursor-pointer transition-all"
            :class="selectedPlan === 'yearly' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-amber-200 bg-amber-50/10 hover:border-amber-400'"
        >
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">2 MOIS OFFERTS</div>
            <div class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Annuel</div>
            <div class="text-2xl font-black text-ui-content">20 €<span class="text-sm font-normal text-ui-content-muted">/an</span></div>
        </div>
      </div>

      <UiButton 
        :loading="loading"
        class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-lg shadow-amber-500/20" 
        @click="handleSubscribe"
      >
        {{ selectedPlan === 'yearly' ? 'S\'abonner (20€/an)' : 'S\'abonner (2€/mois)' }}
      </UiButton>
      <button @click="showPremiumModal = false" class="mt-4 text-xs text-ui-content-muted hover:text-ui-content hover:underline transition-colors">Non merci, je reste en gratuit</button>
      </div>
    </div>
  </UiModal>
</template>