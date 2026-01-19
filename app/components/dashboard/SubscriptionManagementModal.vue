<!-- app/components/dashboard/SubscriptionManagementModal.vue -->
<script setup lang="ts">
const props = defineProps<{
  show: boolean
  user: any
}>()

const emit = defineEmits(['close', 'updated'])
const { notify } = useNotification()
const { showPremiumModal } = usePremium()

const loading = ref(true)
const subscription = ref<any>(null)
const loadingPortal = ref(false)
const showCancelConfirm = ref(false)
const showHistory = ref(false)
const invoices = ref<any[]>([])
const loadingInvoices = ref(false)

// Récupérer les infos dès l'ouverture
watch(() => props.show, async (newVal) => {
  if (newVal) {
    if (props.user?.stripe_customer_id) {
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
    } else {
      loading.value = false
    }
  } else {
    // Reset si on ferme
    showHistory.value = false
  }
})

const fetchInvoices = async () => {
    if (!props.user?.stripe_customer_id) return
    loadingInvoices.value = true
    try {
        invoices.value = await $fetch('/api/stripe/invoices', {
            query: { customerId: props.user.stripe_customer_id }
        })
    } catch (e) {
        notify("Impossible de charger l'historique.", "error")
    } finally {
        loadingInvoices.value = false
    }
}

const handleOpenHistory = () => {
    showHistory.value = true
    fetchInvoices()
}

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
  if (!dateStr) return 'Illimité'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100)
}

const openPremium = () => {
    emit('close')
    showPremiumModal.value = true
}
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full transition-all duration-300" :class="showHistory ? 'max-w-2xl' : 'max-w-md'">
      
      <div class="flex justify-between items-start mb-6">
        <div class="flex items-center gap-2">
            <button v-if="showHistory" @click="showHistory = false" class="p-1 -ml-2 hover:bg-ui-surface-muted rounded-full transition-colors" title="Retour">
                <Icon name="lucide:arrow-left" class="w-5 h-5 text-ui-content-muted" />
            </button>
            <h3 class="text-xl font-black text-ui-content">{{ showHistory ? 'Historique des factures' : 'Mon Abonnement' }}</h3>
        </div>
        <button @click="$emit('close')" class="p-1 hover:bg-ui-surface-muted rounded-full transition-colors">
          <Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" />
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="py-8 flex flex-col items-center justify-center text-ui-content-muted">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mb-2" />
        <span class="text-sm">Récupération des détails...</span>
      </div>

      <!-- VUE HISTORIQUE -->
      <div v-else-if="showHistory" class="space-y-4 animate-in slide-in-from-right-4 duration-300">
         <div v-if="loadingInvoices" class="py-12 flex justify-center">
             <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-ui-content-muted" />
         </div>
         <div v-else-if="invoices.length === 0" class="text-center py-8 text-ui-content-muted">
            <Icon name="lucide:file-x" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune facture disponible.</p>
         </div>
         <div v-else class="overflow-hidden rounded-xl border border-ui-border bg-ui-surface-muted/20">
            <table class="w-full text-sm text-left">
                <thead class="bg-ui-surface-muted text-ui-content-muted font-medium">
                    <tr>
                        <th class="p-3 pl-4">Date</th>
                        <th class="p-3">Montant</th>
                        <th class="p-3">Statut</th>
                        <th class="p-3 text-right pr-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-ui-border">
                    <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-ui-surface-muted/50 transition-colors">
                        <td class="p-3 pl-4 font-medium text-ui-content">{{ formatDate(inv.date) }}</td>
                        <td class="p-3 text-ui-content">{{ formatPrice(inv.amount, inv.currency) }}</td>
                        <td class="p-3">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                :class="inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'">
                                {{ inv.status === 'paid' ? 'Payée' : inv.status }}
                            </span>
                        </td>
                        <td class="p-3 text-right pr-4">
                            <a :href="inv.pdf_url" target="_blank" class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-ui-surface-muted text-ui-content-muted hover:text-blue-600 transition-colors" title="Télécharger la facture">
                                <Icon name="lucide:download" class="w-4 h-4" />
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
         </div>
      </div>

      <!-- Détails -->
      <div v-else-if="subscription && (subscription.status === 'active' || subscription.status === 'trialing')" class="space-y-6 animate-in slide-in-from-left-4 duration-300">
        
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
                Moyen de paiement
              </UiButton>
             <UiButton 
                @click="handleOpenHistory" 
                :disabled="loadingPortal"
                variant="outline"
                class="text-xs h-auto py-3"
              >
                <Icon name="lucide:file-text" class="w-3 h-3 mr-2" />
                Historique & Factures
              </UiButton>
             <UiButton 
                @click="showCancelConfirm = true" 
                :disabled="loadingPortal"
                variant="outline"
                class="col-span-2 text-xs h-auto py-3 text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
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

      <!-- Premium Manuel / Offert (Role 2 mais pas d'abonnement Stripe détecté) -->
      <div v-else-if="user?.role === 2" class="space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div class="flex items-center gap-3 p-4 border border-emerald-100 bg-emerald-50 rounded-xl">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
            <Icon name="lucide:gift" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-emerald-800">Statut</p>
            <p class="font-medium text-emerald-900">Premium (Offert / Manuel)</p>
          </div>
        </div>

        <div class="p-4 bg-ui-surface-muted/50 rounded-xl border border-ui-border">
            <p class="text-xs text-ui-content-muted font-medium mb-1">Expire le</p>
            <p class="text-lg font-black text-ui-content">{{ formatDate(user.current_period_end) }}</p>
        </div>
        <p class="text-xs text-center text-ui-content-muted">Cet accès a été activé manuellement par un administrateur.</p>
      </div>

      <!-- Plan Gratuit -->
      <div v-else class="space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div class="flex items-center gap-3 p-4 border border-ui-border rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div class="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm text-gray-500 dark:text-gray-400">
            <Icon name="lucide:package" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Statut</p>
            <p class="font-medium text-gray-900 dark:text-white">Plan Gratuit</p>
          </div>
        </div>

        <UiButton @click="openPremium" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-lg shadow-amber-500/20">
            <Icon name="lucide:crown" class="w-4 h-4 mr-2" />
            Voir les offres Premium
        </UiButton>
      </div>

    </div>
  </UiModal>
</template>