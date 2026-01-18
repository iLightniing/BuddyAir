<script setup lang="ts">
import { useProfileManager } from '~/composables/useProfileManager'
import { useAvatarManager } from '~/composables/useAvatarManager'
import { useAccountSecurity } from '~/composables/useAccountSecurity'
import { useUserPreferences } from '~/composables/useUserPreferences'
import SubscriptionManagementModal from '~/components/dashboard/SubscriptionManagementModal.vue'

const { isPremium, openPremiumModal } = usePremium()
definePageMeta({ title: 'Mon Profil' })

const pb = usePocketBase()

// --- Data & State Management ---
const {
  user, loading, isEditing, form, sexOptions,
  startEdit, cancelEdit, updateProfile,
  addressSuggestions, showSuggestions, addressContainerRef, onAddressInput, selectAddress,
  showPasswordModal, pwdForm, pwdLoading, updatePassword
} = useProfileManager()

const {
  fileInput, avatarPreview, isUploadingAvatar,
  triggerFileInput, handleAvatarChange
} = useAvatarManager()

const {
  showDeleteConfirm, isDeleting, deleteAccount
} = useAccountSecurity()

const { preferences } = useUserPreferences()

// --- Computed Properties ---
const userInitials = computed(() => {
  const name = user.value?.name || ''
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'U'
})

const showSubModal = ref(false)
const localSubscriptionDate = ref<string | null>(null)
const subscriptionStatus = ref<any>(null)

const fetchSubscriptionStatus = async () => {
  // On récupère toujours le statut Stripe pour savoir si c'est en cours d'annulation
  if (isPremium.value && user.value?.stripe_customer_id) {
    try {
      const sub = await $fetch<any>('/api/stripe/subscription', {
        query: { customerId: user.value.stripe_customer_id }
      })
      subscriptionStatus.value = sub
      if (sub.active && sub.current_period_end) {
        localSubscriptionDate.value = sub.current_period_end
      }
    } catch (e) {
      // Silencieux
    }
  }
}

// Auto-correction de la date "N/A" au chargement
onMounted(fetchSubscriptionStatus)

// Date affichée : soit celle de la BDD, soit celle récupérée à la volée
const displayDate = computed(() => {
  const date = user.value?.subscription_end || user.value?.current_period_end || localSubscriptionDate.value
  return date ? new Date(date).toLocaleDateString() : 'Chargement...'
})

const cardTheme = computed(() => {
  const role = user.value?.role
  const isCancelled = subscriptionStatus.value?.cancel_at_period_end

  // Cas 3 : Administrateur (Légendaire / Arc-en-ciel)
  if (role === 3) {
    return {
      classes: 'bg-white border-purple-200 shadow-lg shadow-purple-500/10',
      blur: 'bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500',
      text: 'text-purple-600',
      icon: 'lucide:shield-check',
      label: 'Administrateur'
    }
  }
  
  // Cas 2 : Premium
  if (role === 2) {
    // Sous-cas : Annulation demandée (Rouge)
    if (isCancelled) {
      return {
        classes: 'bg-white border-red-200',
        blur: 'bg-red-400',
        text: 'text-red-600',
        icon: 'lucide:clock',
        label: 'Premium (Fin)'
      }
    }
    // Sous-cas : Actif (Vert)
    return {
      classes: 'bg-white border-emerald-200',
      blur: 'bg-emerald-400',
      text: 'text-emerald-600',
      icon: 'lucide:crown',
      label: 'Premium'
    }
  }

  // Cas 1 : Gratuit (Ambre/Gold)
  return {
    classes: 'bg-white border-amber-200',
    blur: 'bg-amber-400',
    text: 'text-amber-600',
    icon: 'lucide:sparkles',
    label: 'Gratuit'
  }
})
</script>

<template>
  <div v-if="user" class="max-w-5xl mx-auto space-y-8">
    <DashboardProfileHeader 
      :user="user" 
      :loading="loading" 
      :is-editing="isEditing" 
      :user-initials="userInitials"
      @start-edit="startEdit"
      @cancel-edit="cancelEdit"
      @save="updateProfile"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <!-- Colonne Gauche : Infos -->
       <div class="lg:col-span-2 space-y-8">
          <form @submit.prevent="updateProfile" class="space-y-8">
            <DashboardProfileIdentityCard :form="form" :sex-options="sexOptions" :is-editing="isEditing" />
            
            <DashboardProfileAddressCard 
              :form="form" 
              :is-editing="isEditing" 
              :address-suggestions="addressSuggestions" 
              :show-suggestions="showSuggestions"
              @input-address="onAddressInput"
              @select-address="selectAddress"
              ref="addressContainerRef"
            />
          </form>
       </div>

       <!-- Colonne Droite : Sécurité -->
       <div class="space-y-8">
          <!-- Carte Abonnement -->
          <div class="relative overflow-hidden rounded-2xl border transition-all"
               :class="cardTheme.classes">
              
              <!-- Background Pattern -->
              <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-2xl opacity-50"
                   :class="cardTheme.blur"></div>

              <div class="p-5 relative z-10">
                  <div class="flex justify-between items-start mb-4">
                      <div>
                          <p class="text-[10px] font-black uppercase tracking-widest mb-1" :class="cardTheme.text">Mon Abonnement</p>
                          <h3 class="text-xl font-black text-ui-content flex items-center gap-2">
                              {{ cardTheme.label }}
                              <Icon v-if="user?.role === 2 && !subscriptionStatus?.cancel_at_period_end" name="lucide:check-circle-2" class="w-5 h-5 text-emerald-500" />
                          </h3>
                      </div>
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-gray-50" :class="cardTheme.text">
                          <Icon :name="cardTheme.icon" class="w-5 h-5" />
                      </div>
                  </div>

                  <div v-if="user?.role === 1" class="space-y-4">
                      <p class="text-sm text-ui-content-muted font-medium">Débloquez les échéances automatiques et les comptes crédits.</p>
                      <button @click="openPremiumModal" class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-md shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                          Passer Premium
                          <Icon name="lucide:arrow-right" class="w-4 h-4" />
                      </button>
                  </div>

                  <div v-else-if="user?.role === 2">
                      <p class="text-sm text-ui-content-muted mb-2">
                        {{ subscriptionStatus?.cancel_at_period_end ? "Fin de l'abonnement le" : "Renouvellement le" }} 
                        <span class="font-bold text-ui-content">{{ displayDate }}</span>
                      </p>
                      <button @click="showSubModal = true" class="text-xs font-bold hover:underline" :class="subscriptionStatus?.cancel_at_period_end ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'">
                        Gérer mon abonnement
                      </button>
                  </div>

                  <div v-else-if="user?.role === 3" class="space-y-4">
                      <p class="text-sm text-ui-content-muted font-medium">Compte administrateur avec accès illimité.</p>
                      <div class="flex gap-2">
                         <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                           Super Admin
                         </span>
                      </div>
                  </div>
              </div>
          </div>

          <DashboardProfileSecurityCard :user="user" @edit-password="showPasswordModal = true" />

          <DashboardProfilePreferencesCard :preferences="preferences" />

          <DashboardProfileDangerZone @delete="showDeleteConfirm = true" />
       </div>
    </div>

    <DashboardProfileDeleteAccountModal 
      :show="showDeleteConfirm" 
      :user="user" 
      :loading="isDeleting" 
      @close="showDeleteConfirm = false" 
      @confirm="deleteAccount" 
    />

    <DashboardProfilePasswordModal 
      :show="showPasswordModal" 
      :form="pwdForm" 
      :loading="pwdLoading" 
      @close="showPasswordModal = false" 
      @submit="updatePassword" 
    />

    <SubscriptionManagementModal 
      :show="showSubModal"
      :user="user"
      @close="showSubModal = false"
      @updated="fetchSubscriptionStatus"
    />
  </div>
  <div v-else class="flex justify-center items-center min-h-[50vh]">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-ui-content-muted" />
  </div>
</template>