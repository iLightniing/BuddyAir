<script setup lang="ts">
definePageMeta({
  title: 'Aperçu global'
})

const pb = usePocketBase()
const user = usePocketBaseUser()
const loading = ref(true)

const totalBalance = ref(0)
const accounts = ref<any[]>([])
const recentTransactions = ref<any[]>([])

onMounted(async () => {
  loading.value = true
  try {
    // 1. Récupérer les comptes pour le solde total
    accounts.value = await pb.collection('accounts').getFullList({ sort: '+order' })
    totalBalance.value = accounts.value.reduce((sum, acc) => sum + acc.current_balance, 0)

    // 2. Récupérer les dernières transactions (tous comptes confondus)
    // On utilise 'expand' pour récupérer les infos du compte lié (nom, banque)
    const result = await pb.collection('transactions').getList(1, 5, {
      sort: '-date,-created',
      expand: 'account'
    })
    recentTransactions.value = result.items
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const getTransactionIcon = (type: string) => type === 'income' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'

const getTransactionClass = (type: string) => {
  return type === 'income' 
    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
    : 'bg-ui-surface-muted border-ui-border text-ui-content-muted'
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header & Solde Total -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Carte Solde Principal -->
      <div class="md:col-span-2 bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-200/50 relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div class="relative z-10">
          <p class="text-slate-400 font-medium text-sm uppercase tracking-widest mb-2">Solde total</p>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight mb-8">
            {{ totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}
          </h2>
          
          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink to="/dashboard/accounts" class="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              <Icon name="lucide:wallet" class="w-4 h-4" />
              Gérer mes comptes
            </NuxtLink>
            <button class="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
              <Icon name="lucide:plus" class="w-4 h-4" />
              Virement rapide
            </button>
          </div>
        </div>
      </div>

      <!-- Widget Résumé -->
      <div class="bg-ui-surface border border-ui-border rounded-3xl p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-black text-ui-content mb-1">Mes Comptes</h3>
          <p class="text-sm text-ui-content-muted">{{ accounts.length }} comptes actifs</p>
        </div>
        
        <div class="space-y-3 mt-6">
          <NuxtLink 
            v-for="acc in accounts.slice(0, 3)" 
            :key="acc.id" 
            :to="`/dashboard/accounts/${acc.id}`"
            class="flex justify-between items-center p-2 -mx-2 rounded-lg hover:bg-ui-surface-muted transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors" 
                :class="acc.current_balance >= 0 ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-red-50 text-red-600 group-hover:bg-red-100'">
                <Icon :name="acc.account_group === 'savings' ? 'lucide:piggy-bank' : 'lucide:credit-card'" class="w-4 h-4" />
              </div>
              <span class="text-sm font-bold text-ui-content truncate max-w-[100px]">{{ acc.name }}</span>
            </div>
            <span class="text-sm font-bold tabular-nums" :class="acc.current_balance >= 0 ? 'text-emerald-600' : 'text-ui-content'">
              {{ Math.round(acc.current_balance).toLocaleString() }} €
            </span>
          </NuxtLink>
          <div v-if="accounts.length > 3" class="text-xs text-center text-ui-content-muted pt-2 border-t border-ui-border">
            + {{ accounts.length - 3 }} autres comptes
          </div>
        </div>
      </div>
    </div>

    <!-- Dernières Transactions -->
    <div class="space-y-4">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xl font-black text-ui-content tracking-tight">Dernières opérations</h3>
        <button class="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider">Tout voir</button>
      </div>

      <div v-if="loading" class="py-12 flex justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
      </div>

      <div v-else-if="recentTransactions.length > 0" class="bg-ui-surface border border-ui-border rounded-2xl overflow-hidden shadow-sm">
        <NuxtLink v-for="(tx, index) in recentTransactions" :key="tx.id" 
          :to="`/dashboard/accounts/${tx.account}`"
          class="flex items-center justify-between p-5 hover:bg-ui-surface-muted transition-colors group cursor-pointer"
          :class="index !== recentTransactions.length - 1 ? 'border-b border-ui-border' : ''"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border" :class="getTransactionClass(tx.type)">
              <Icon :name="getTransactionIcon(tx.type)" class="w-5 h-5" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-bold text-ui-content text-sm truncate">{{ tx.description || 'Sans description' }}</p>
              <p class="text-xs text-ui-content-muted flex items-center gap-1">
                {{ new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}
                <span class="w-1 h-1 rounded-full bg-ui-border"></span>
                {{ tx.expand?.account?.name || 'Compte inconnu' }}
              </p>
            </div>
          </div>
          <span class="font-black text-sm tabular-nums" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-ui-content'">
            {{ tx.type === 'income' ? '+' : '-' }} {{ Math.abs(tx.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}
          </span>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-12 bg-ui-surface border border-ui-border rounded-2xl border-dashed">
        <p class="text-ui-content-muted text-sm">Aucune transaction récente.</p>
      </div>
    </div>
  </div>
</template>