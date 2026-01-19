<script setup lang="ts">
import PremiumModal from '~/components/dashboard/PremiumModal.vue'
import PaymentSuccessModal from '~/components/dashboard/PaymentSuccessModal.vue'
const pb = usePocketBase()
const user = usePocketBaseUser()

const { refreshKey } = useDashboardRefresh()
const { isImpersonating, stopImpersonation } = useImpersonation()
const { notify } = useNotification()
const route = useRoute()
const router = useRouter()

const forceClearImpersonation = async () => {
    if (user.value) {
        try {
            // Force le nettoyage du flag en BDD
            await pb.collection('users').update(user.value.id, { is_being_impersonated: false })
            // Mise à jour locale immédiate
            user.value = { ...user.value, is_being_impersonated: false }
        } catch (e) {}
    }
}

// Écoute temps réel pour le flag d'impersonation
watch(user, async (newUser, oldUser) => {
    const newId = newUser?.id
    const oldId = oldUser?.id

    // On ignore les erreurs de désabonnement si l'utilisateur est déjà déconnecté
    if (oldId) {
        try { await pb.collection('users').unsubscribe(oldId) } catch (e) {}
    }
    
    if (newId && pb.authStore.isValid) {
        pb.collection('users').subscribe(newId, (e) => {
             if (e.action === 'update' && user.value) {
                 // Mise à jour silencieuse des données utilisateur (dont is_being_impersonated)
                 user.value = { ...user.value, ...e.record }
             }
        }).catch(e => {
            // On ignore les erreurs 403 dues aux transitions d'auth (logout/login rapide)
            if (e.status !== 403) console.warn("Erreur subscription dashboard:", e)
        })
    }

    // Auto-fix : Si on est Admin et qu'on a le flag "support" coincé sans être en mode impersonation
    if (newUser?.role === 3 && newUser?.is_being_impersonated && !isImpersonating.value) {
        await forceClearImpersonation()
    }
}, { immediate: true })

const showSuccessModal = ref(false)

// Rafraîchir les données utilisateur au chargement pour récupérer les mises à jour (ex: retour de paiement Stripe)
onMounted(async () => {
    if (user.value && pb.authStore.isValid) {
        const refreshUser = async () => {
            try {
                const freshUser = await pb.collection('users').getOne(user.value.id)
                // Si le rôle a changé ou si l'utilisateur a été mis à jour récemment
                if (freshUser.role !== user.value.role || freshUser.updated !== user.value.updated) {
                    pb.authStore.save(pb.authStore.token, freshUser)
                    user.value = freshUser
                    return true // Changement détecté
                }
            } catch (e) {
                console.error("Erreur refresh user:", e)
            }
            return false
        }

        // 1. Vérification immédiate
        await refreshUser()

        // 2. Si l'utilisateur est toujours gratuit (Role 1), on insiste pendant quelques secondes
        // C'est crucial pour le retour de Stripe où le Webhook peut avoir 1 à 3 secondes de retard
        if (user.value.role === 1) {
            let attempts = 0
            const interval = setInterval(async () => {
                attempts++
                const changed = await refreshUser()
                
                // Arrêt si : changement détecté OU 4 essais passés (8s) OU utilisateur devenu Premium
                if (changed || attempts >= 4 || user.value.role !== 1) {
                    clearInterval(interval)
                    if (changed) notify("Abonnement activé avec succès !", "success")
                }
            }, 2000) // Vérifie toutes les 2 secondes
        }
    }

    // Détection du retour de paiement réussi
    if (route.query.checkout_success) {
        showSuccessModal.value = true
        // Nettoyage de l'URL sans recharger la page
        const newQuery = { ...route.query }
        delete newQuery.checkout_success
        router.replace({ query: newQuery })
    }
})
</script>

<template>
  <div class="flex min-h-screen w-full">
    <!-- Sidebar fixe à gauche (Cachée sur mobile) -->
    <aside class="hidden md:block fixed inset-y-0 left-0 z-50">
      <DashboardSidebar />
    </aside>

    <div class="flex-1 flex flex-col md:ml-20 pb-20 md:pb-0 transition-all duration-300 min-w-0">
      <!-- Header supérieur -->
      <DashboardHeader />

      <!-- Bandeau Impersonation -->
      <div v-if="isImpersonating" class="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between shadow-md relative z-50">
        <div class="flex items-center gap-2 text-sm font-medium">
            <Icon name="lucide:venetian-mask" class="w-4 h-4" />
            <span>Vous êtes connecté en tant que {{ user?.name || user?.email || 'Utilisateur' }}.</span>
        </div>
        <button @click="stopImpersonation" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition-colors border border-white/30">Revenir Admin</button>
      </div>

      <!-- Bandeau Mode Support (Visible par l'utilisateur uniquement) -->
      <div v-else-if="user?.is_being_impersonated" class="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md relative z-40 animate-in slide-in-from-top-full duration-500">
         <div class="flex items-center gap-3 text-sm font-medium">
            <div class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </div>
            <span>Le support est connecté sur votre compte pour analyser votre problème...</span>
        </div>
        <button @click="forceClearImpersonation" class="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors" title="Fermer la session de support">
            <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>

      <UiAnnouncementBanner />

      <!-- Zone de contenu -->
      <main class="flex-1 p-4 sm:p-6 lg:p-12">
        <div :key="refreshKey" class="h-full">
          <slot />
        </div>
      </main>
    </div>

    <!-- Navigation Mobile (Bottom Bar) -->
    <DashboardBottomNav />

    <!-- Global Command Palette -->
    <DashboardCommandPalette />

    <!-- Modale Premium Globale -->
    <PremiumModal />
    
    <!-- Modale Succès Paiement -->
    <PaymentSuccessModal :show="showSuccessModal" @close="showSuccessModal = false" />

    <!-- Notifications -->
    <UiNotification />
  </div>
</template>