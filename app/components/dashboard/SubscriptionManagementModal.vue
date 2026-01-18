<!-- app/components/dashboard/SubscriptionManagementModal.vue -->
<script setup lang="ts">
const props = defineProps<{
  show: boolean
  user: any
}>()

const emit = defineEmits(['close', 'updated'])
const { notify } = useNotification()

const loading = ref(true)
const subscription = ref<any>(null)
const loadingPortal = ref(false)
const showCancelConfirm = ref(false)

// Récupérer les infos dès l'ouverture
watch(() => props.show, async (newVal) => {
  if (newVal && props.user?.stripe_customer_id) {
    loading.value = true
    try {
      subscription.value = await $fetch('/api/stripe/subscription', {
        query: { customerId: props.user.stripe_customer_id }
      })
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }
})

const cancelSubscription = async () => {
    loadingPortal.value = true
    try {
        await $fetch('/api/stripe/cancel', {
            method: 'POST',
            body: { subscriptionId: subscription.value?.id }
        })
        notify("Abonnement résilié. Il restera actif jusqu'à la fin de la période.", "success")
        emit('updated')
        emit('close')
    } catch (e) {
        notify("Erreur lors de la résiliation.", "error")
    } finally {
        loadingPortal.value = false
    }
}

// Redirection vers le portail Stripe pour les actions complexes
const openStripePortal = async (flow?: 'payment_method_update' | 'subscription_cancel') => {
  loadingPortal.value = true
  try {
    const { url } = await $fetch<{ url: string }>('/api/stripe/portal', {
      method: 'POST',
      body: { 
        customerId: props.user.stripe_customer_id,
        returnUrl: window.location.href,
        flow,
        subscriptionId: subscription.value?.id
      }
    })
    if (url) window.location.href = url
  } catch (e) {
    notify("Impossible de se connecter au portail Stripe.", "error")
  } finally {
    loadingPortal.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100)
}
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-md w-full">
      
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-xl font-black text-ui-content">Mon Abonnement</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-ui-surface-muted rounded-full transition-colors">
          <Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" />
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="py-8 flex flex-col items-center justify-center text-ui-content-muted">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mb-2" />
        <span class="text-sm">Récupération des détails...</span>
      </div>

      <!-- Détails -->
      <div v-else-if="subscription && (subscription.status === 'active' || subscription.status === 'trialing')" class="space-y-6">
        
        <!-- Badge Statut -->
        <div class="flex items-center gap-3 p-4 border rounded-xl transition-colors"
             :class="subscription.cancel_at_period_end ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
               :class="subscription.cancel_at_period_end ? 'text-red-600' : 'text-emerald-600'">
            <Icon :name="subscription.cancel_at_period_end ? 'lucide:clock' : 'lucide:check-circle-2'" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider" :class="subscription.cancel_at_period_end ? 'text-red-800' : 'text-emerald-800'">Statut</p>
            <p class="font-medium" :class="subscription.cancel_at_period_end ? 'text-red-900' : 'text-emerald-900'">
              {{ subscription.cancel_at_period_end ? 'Annulation programmée' : 'Actif & Renouvellement auto' }}
            </p>
          </div>
        </div>

        <!-- Infos Clés -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-ui-surface-muted/50 rounded-xl border border-ui-border">
            <p class="text-xs text-ui-content-muted font-medium mb-1">
              {{ subscription.cancel_at_period_end ? "Fin de l'abonnement" : "Prochaine facture" }}
            </p>
            <p class="text-lg font-black text-ui-content">{{ formatDate(subscription.current_period_end) }}</p>
          </div>
          <div class="p-4 bg-ui-surface-muted/50 rounded-xl border border-ui-border">
            <p class="text-xs text-ui-content-muted font-medium mb-1">Montant</p>
            <p class="text-lg font-black text-ui-content">
              {{ formatPrice(subscription.plan.amount, subscription.plan.currency) }}
              <span class="text-xs font-normal text-ui-content-muted">/ {{ subscription.plan.interval === 'month' ? 'mois' : 'an' }}</span>
            </p>
          </div>
        </div>

        <!-- Confirmation Annulation -->
        <div v-if="showCancelConfirm" class="bg-red-50 border border-red-100 rounded-xl p-4 animate-in slide-in-from-bottom-2">
            <h4 class="text-sm font-bold text-red-900 mb-2">Êtes-vous sûr ?</h4>
            <p class="text-xs text-red-700 mb-4">
                Vous perdrez l'accès aux fonctionnalités Premium à la fin de votre période actuelle ({{ formatDate(subscription.current_period_end) }}).
            </p>
            <div class="flex gap-2">
                <UiButton @click="showCancelConfirm = false" variant="secondary" size="sm" class="w-full">Retour</UiButton>
                <UiButton 
                    @click="cancelSubscription" 
                    :loading="loadingPortal"
                    class="w-full bg-red-600 hover:bg-red-700 text-white border-red-700" size="sm">
                    Confirmer la résiliation
                </UiButton>
            </div>
        </div>

        <!-- Actions -->
        <div v-else class="pt-4 border-t border-ui-border space-y-3">
          <UiButton 
            @click="openStripePortal()" 
            :disabled="loadingPortal"
            class="w-full bg-ui-content text-ui-surface hover:bg-ui-content/90 shadow-lg"
          >
            <Icon v-if="loadingPortal" name="lucide:loader-2" class="w-4 h-4 animate-spin mr-2" />
            <Icon v-else name="lucide:external-link" class="w-4 h-4 mr-2" />
            {{ subscription.cancel_at_period_end ? 'Gérer / Réactiver l\'abonnement' : 'Accéder au portail complet' }}
          </UiButton>

          <div class="grid grid-cols-2 gap-3" v-if="!subscription.cancel_at_period_end">
             <UiButton 
                @click="openStripePortal('payment_method_update')" 
                :disabled="loadingPortal"
                variant="outline"
                class="text-xs h-auto py-3"
              >
                <Icon name="lucide:credit-card" class="w-3 h-3 mr-2" />
                Changer de carte
              </UiButton>
             <UiButton 
                @click="showCancelConfirm = true" 
                :disabled="loadingPortal"
                variant="outline"
                class="text-xs h-auto py-3 text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <Icon name="lucide:ban" class="w-3 h-3 mr-2" />
                Se désabonner
              </UiButton>
          </div>
          
          <div v-else class="text-center">
             <p class="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                Votre abonnement s'arrêtera automatiquement à la date indiquée. Vous pouvez le réactiver via le portail avant cette date.
             </p>
          </div>

          <p class="text-center text-xs text-ui-content-muted mt-1">
            Vous serez redirigé vers l'espace sécurisé Stripe.
          </p>
        </div>
      </div>

      <!-- Erreur / Pas d'abo -->
      <div v-else class="text-center py-6">
        <p class="text-ui-content-muted">Aucun abonnement actif trouvé.</p>
      </div>

    </div>
  </UiModal>
</template>