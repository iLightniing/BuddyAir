<script setup lang="ts">
import CGUModal from '~/components/dashboard/CGUModal.vue'
import PrivacyModal from '~/components/dashboard/PrivacyModal.vue'

const pb = usePocketBase()
const version = ref('1.0.0')
const loading = ref(true)
const showCGU = ref(false)
const showPrivacy = ref(false)

onMounted(async () => {
  try {
    // Récupération de la dernière version via les patchnotes
    const lastPatchnote = await pb.collection('patchnotes').getFirstListItem('', { 
        sort: '-created',
        fields: 'version'
    })
    if (lastPatchnote && lastPatchnote.version) {
        version.value = lastPatchnote.version
    }
  } catch (e) {
    // Fallback si pas de patchnote ou erreur
    console.warn("Impossible de récupérer la version depuis les patchnotes", e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-ui-surface border border-ui-border rounded-2xl p-8 shadow-sm text-center space-y-8">
        
        <!-- Logo & Version -->
        <div class="space-y-4">
            <div class="w-24 h-24 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Icon name="lucide:plane" class="w-12 h-12 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-ui-content tracking-tight">BuddyAir</h1>
                <p class="text-ui-content-muted font-medium flex items-center justify-center gap-2 mt-2">
                    <span v-if="loading" class="animate-pulse">Chargement...</span>
                    <span v-else>v{{ version }}</span>
                </p>
            </div>
        </div>

        <div class="w-full h-px bg-ui-border"></div>

        <!-- Liens Légaux -->
        <div class="space-y-3">
            <button @click="showCGU = true" class="w-full p-4 rounded-xl border border-ui-border hover:bg-ui-surface-muted transition-colors flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon name="lucide:scale" class="w-5 h-5" />
                    </div>
                    <span class="font-bold text-ui-content">Conditions Générales d'Utilisation</span>
                </div>
                <Icon name="lucide:chevron-right" class="w-5 h-5 text-ui-content-muted" />
            </button>

            <button @click="showPrivacy = true" class="w-full p-4 rounded-xl border border-ui-border hover:bg-ui-surface-muted transition-colors flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon name="lucide:shield-check" class="w-5 h-5" />
                    </div>
                    <span class="font-bold text-ui-content">Politique de Confidentialité</span>
                </div>
                <Icon name="lucide:chevron-right" class="w-5 h-5 text-ui-content-muted" />
            </button>
        </div>

        <div class="text-xs text-ui-content-muted pt-4">
            © {{ new Date().getFullYear() }} BuddyAir. Tous droits réservés.
        </div>
    </div>

    <CGUModal :show="showCGU" @close="showCGU = false" />
    <PrivacyModal :show="showPrivacy" @close="showPrivacy = false" />
  </div>
</template>