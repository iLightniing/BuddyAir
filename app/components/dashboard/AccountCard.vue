<script setup lang="ts">
const props = defineProps<{
  account: any
  isEditMode: boolean
}>()

const emit = defineEmits(['edit', 'delete'])

const cardClasses = computed(() => {
  switch (props.account.account_group) {
    case 'savings':
      // Thème vert pour l'épargne
      return 'bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 text-emerald-900 border-emerald-200 hover:shadow-emerald-500/10'
    case 'credit':
      // Thème clair avec accent rouge pour les crédits
      return 'bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 text-red-900 border-red-200 hover:shadow-red-500/10'
    case 'current':
    default:
      // Thème sombre "pro" pour les comptes courants
      return 'bg-slate-800 text-white border-slate-700 hover:shadow-slate-900/20'
  }
})

// Calculs "Pro" pour l'affichage
const proInfos = computed(() => {
  const acc = props.account
  
  // Épargne : Intérêts estimés ce mois-ci
  if (acc.account_group === 'savings' && acc.interest_rate) {
    const monthlyInterest = (acc.current_balance * (acc.interest_rate / 100)) / 12
    return [{ label: 'Intérêts/mois', value: `+${monthlyInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}` }]
  }

  // Crédit : Date de fin estimée
  if (acc.account_group === 'credit' && acc.loan_start_date && acc.loan_duration) {
    const endDate = new Date(acc.loan_start_date)
    endDate.setMonth(endDate.getMonth() + acc.loan_duration)
    return [{ label: 'Fin du prêt', value: endDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) }]
  }

  // Courant : Solde jour & Fin de mois
  if (acc.account_group === 'current') {
    return null
  }

  return null
})

const handleClick = () => {
  if (!props.isEditMode) {
    navigateTo(`/dashboard/accounts/${props.account.id}`)
  }
}
</script>

<template>
  <div
    @click="handleClick"
    class="relative overflow-hidden p-6 rounded-2xl transition-all duration-300 group border h-full block text-left"
    :class="[
      isEditMode ? 'shake-animation' : 'hover:-translate-y-1 hover:shadow-xl',
      !isEditMode ? 'cursor-pointer' : '',
      cardClasses
    ]"
  >
    <!-- Background decoration -->
    <div class="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
      :class="account.current_balance >= 0 ? 'bg-blue-400' : 'bg-red-400'"></div>
    
    <div class="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
      :class="account.current_balance >= 0 ? 'bg-pink-400' : 'bg-orange-400'"></div>

    <!-- Card Content -->
    <div class="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-black uppercase tracking-widest opacity-70">{{ account.bank }}</span>
          <div class="flex items-center gap-2 mt-1">
            <Icon name="lucide:nfc" class="w-5 h-5 opacity-70" />
          </div>
        </div>
        
        <!-- Actions (Edit Mode) or Icon (View Mode) -->
        <div v-if="isEditMode" class="flex gap-2 relative z-20">
          <button @click.stop="emit('edit', account)" @pointerdown.stop class="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all hover:scale-110" title="Modifier">
            <Icon name="lucide:pencil" class="w-4 h-4" />
          </button>
          <button @click.stop="emit('delete', account)" @pointerdown.stop class="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-50 transition-all hover:scale-110" title="Supprimer">
            <Icon name="lucide:trash-2" class="w-4 h-4" />
          </button>
        </div>
        <div v-else class="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border"
             :class="account.account_group === 'current' ? 'bg-white/10 border-white/10' : 'bg-white/60 border-white/20'">
          <Icon :name="account.account_group === 'savings' ? 'lucide:piggy-bank' : 'lucide:credit-card'" class="w-5 h-5" />
        </div>
      </div>

      <!-- Balance -->
      <div class="mt-6">
        <p class="text-xs font-medium opacity-70 mb-1">Solde actuel</p>
        <p class="text-3xl font-black tracking-tight tabular-nums" :class="{ 'text-red-400': account.account_group === 'current' && account.current_balance < 0, 'text-red-600': account.account_group !== 'current' && account.current_balance < 0 }">
          {{ account.current_balance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}
        </p>
      </div>

      <!-- Infos Pro (Taux, Mensualités, Type) -->
      <div class="mt-4 space-y-2">
        <!-- Épargne -->
        <div v-if="account.account_group === 'savings'" class="flex flex-wrap items-center gap-2 text-xs font-medium opacity-80">
          <span v-if="account.interest_rate !== null && account.interest_rate !== undefined" class="px-2 py-1 rounded-md bg-emerald-100/50 border border-emerald-200/50 flex items-center gap-1" title="Taux d'intérêt">
            <Icon name="lucide:percent" class="w-3 h-3" /> {{ account.interest_rate }}
          </span>
          <span v-if="account.savings_type" class="px-2 py-1 rounded-md bg-emerald-100/50 border border-emerald-200/50">
            {{ account.savings_type }}
          </span>
          <div v-for="(info, i) in proInfos" :key="i" class="w-full mt-1 pt-2 border-t border-emerald-200/30 flex justify-between items-center">
            <span class="text-[10px] uppercase tracking-wider">{{ info.label }}</span>
            <span class="font-bold">{{ info.value }}</span>
          </div>
        </div>

        <!-- Crédit -->
        <div v-if="account.account_group === 'credit'" class="flex flex-wrap items-center gap-2 text-xs font-medium opacity-80">
          <span v-if="account.monthly_payment" class="px-2 py-1 rounded-md bg-red-100/50 border border-red-200/50 flex items-center gap-1" title="Mensualité">
            <Icon name="lucide:calendar-clock" class="w-3 h-3" />
            {{ Number(account.monthly_payment).toLocaleString('fr-FR', { style: 'currency', currency: account.currency || 'EUR' }) }}/mois
          </span>
          <span v-if="account.interest_rate !== null && account.interest_rate !== undefined" class="px-2 py-1 rounded-md bg-red-100/50 border border-red-200/50 flex items-center gap-1" title="Taux d'intérêt">
            <Icon name="lucide:percent" class="w-3 h-3" /> {{ account.interest_rate }}
          </span>
          <div v-for="(info, i) in proInfos" :key="i" class="w-full mt-1 pt-2 border-t border-red-200/30 flex justify-between items-center">
            <span class="text-[10px] uppercase tracking-wider">{{ info.label }}</span>
            <span class="font-bold">{{ info.value }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t flex justify-between items-center" :class="account.account_group === 'current' ? 'border-white/10' : 'border-black/10'">
        <div class="flex flex-col min-w-0">
          <h3 class="font-bold text-sm truncate">{{ account.name }}</h3>
          <span class="text-xs font-mono opacity-70 tracking-wider">•••• {{ account.id.substring(0, 4) }}</span>
        </div>
        <Icon v-if="!isEditMode" name="lucide:chevron-right" class="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
}
.shake-animation {
  animation: shake 0.3s infinite;
}
</style>