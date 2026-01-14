<script setup lang="ts">
const props = defineProps<{
  accounts: any[]
}>()

const situation = computed(() => {
  // Calcul basé uniquement sur les comptes courants (argent disponible)
  const currentAccountsBalance = props.accounts
    .filter(a => a.account_group === 'current')
    .reduce((sum, acc) => sum + acc.current_balance, 0)

  if (currentAccountsBalance > 5000) {
    return {
      label: 'Excellente',
      icon: 'lucide:party-popper',
      color: 'text-emerald-600',
      bgIcon: 'bg-emerald-100',
      border: 'border-emerald-200',
      message: 'Vos finances sont au top ! Profitez-en pour épargner.'
    }
  }
  if (currentAccountsBalance > 1000) {
    return {
      label: 'Bonne',
      icon: 'lucide:smile',
      color: 'text-blue-600',
      bgIcon: 'bg-blue-100',
      border: 'border-blue-200',
      message: 'Situation saine. Vous êtes sur la bonne voie.'
    }
  }
  if (currentAccountsBalance >= 0) {
    return {
      label: 'Stable',
      icon: 'lucide:meh',
      color: 'text-orange-600',
      bgIcon: 'bg-orange-100',
      border: 'border-orange-200',
      message: 'À l\'équilibre. Restez vigilant sur vos dépenses.'
    }
  }
  return {
    label: 'Critique',
    icon: 'lucide:frown',
    color: 'text-red-600',
    bgIcon: 'bg-red-100',
    border: 'border-red-200',
    message: 'Attention, votre solde est négatif. Action requise.'
  }
})
</script>

<template>
  <div class="bg-ui-surface p-4 rounded-xl border shadow-sm flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-md" :class="situation.border">
    <div class="flex items-start justify-between mb-2 relative z-10">
       <div class="flex flex-col">
          <span class="text-sm font-medium text-ui-content-muted">Situation</span>
          <div class="text-2xl font-black tracking-tight mt-1" :class="situation.color">
            {{ situation.label }}
          </div>
       </div>
       <div class="p-2 rounded-xl flex items-center justify-center" :class="situation.bgIcon">
          <Icon :name="situation.icon" class="w-8 h-8" :class="situation.color" />
       </div>
    </div>
    
    <p class="text-xs font-medium text-ui-content-muted relative z-10 leading-relaxed">
      {{ situation.message }}
    </p>
  </div>
</template>