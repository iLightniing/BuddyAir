<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Mes Comptes'
})

// On utilise <any> car la table 'accounts' n'est pas encore présente dans vos types Database générés
const supabase = useSupabaseClient<any>()
const accounts = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)

const fetchAccounts = async () => {
  loading.value = true

  // Suppression du délai artificiel pour un affichage instantané des données
  const { data } = await supabase.from('accounts').select('*').order('created_at', { ascending: false })

  accounts.value = data || []
  loading.value = false
}
onMounted(fetchAccounts)
</script>
<template>
  <div class="space-y-6 min-h-[400px]">
    <!-- Liste des comptes -->
    <Transition name="fade" mode="out-in">
      <!-- État de chargement invisible pour éviter le flash des skeletons -->
      <div v-if="loading" key="loading" />

      <div v-else key="content" class="space-y-6">
        <!-- Barre d'actions -->
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-black text-ui-content-muted uppercase tracking-[0.3em]">Portefeuille</h2>
          <button 
            @click="showModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-ui-surface hover:bg-ui-surface-muted rounded-md border border-ui-border text-ui-content text-xs font-bold transition-all shadow-sm cursor-pointer group"
          >
            <Icon name="lucide:plus" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 text-blue-500" />
            Ajouter un compte
          </button>
        </div>

        <!-- Grille des comptes -->
        <div v-if="accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink 
            v-for="acc in accounts" 
            :key="acc.id"
            :to="`/dashboard/accounts/${acc.id}`"
            class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-sm hover:shadow-md hover:border-blue-400/30 transition-all group"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 bg-ui-surface-muted rounded-lg flex items-center justify-center text-ui-content-muted group-hover:text-blue-500 transition-colors">
                <Icon name="lucide:landmark" class="w-5 h-5" />
              </div>
              <span class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest">{{ acc.bank }}</span>
            </div>
            <h3 class="text-lg font-black text-ui-content tracking-tight mb-1">{{ acc.name }}</h3>
            <p class="text-2xl font-black text-ui-content tabular-nums">
              {{ acc.current_balance.toLocaleString('fr-FR', { style: 'currency', currency: acc.currency }) }}
            </p>
          </NuxtLink>
        </div>

        <!-- État vide -->
        <div v-else class="relative bg-ui-surface border border-ui-border rounded-md p-12 text-center shadow-sm">
          <div class="w-16 h-16 bg-ui-surface-muted rounded-2xl flex items-center justify-center mb-6 mx-auto text-ui-content-muted/20">
            <Icon name="lucide:wallet-minimal" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-black text-ui-content mb-2">Aucun compte configuré</h3>
          <p class="text-ui-content-muted text-sm italic mb-8">Commencez par ajouter votre premier compte bancaire ou livret d'épargne.</p>
          <UiButton @click="showModal = true" variant="secondary">Créer mon premier compte</UiButton>
        </div>
      </div>
    </Transition>

    <!-- Modal -->
    <DashboardAccountModal :show="showModal" @close="showModal = false" @success="fetchAccounts" />
  </div>
</template>