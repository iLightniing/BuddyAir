<script setup lang="ts">
const props = defineProps<{
  account: any
  currentDate: Date
  balances: { current: number, cleared: number, projected: number }
}>()

const emit = defineEmits(['prev-month', 'next-month', 'add'])

const currentMonthLabel = computed(() => {
  return props.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="relative flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-ui-surface border border-ui-border p-3 rounded-md shadow-sm sticky top-14 z-30">
      
      <!-- Gauche : Navigation & Actions -->
      <div class="flex items-center gap-2 w-full xl:w-auto">
        <NuxtLink to="/dashboard/accounts" class="p-2 hover:bg-ui-surface-muted rounded-md text-ui-content-muted hover:text-ui-content transition-colors" title="Retour aux comptes">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>

        <div class="h-6 w-px bg-ui-border hidden sm:block mx-2"></div>

        <button 
          @click="emit('add')"
          class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
          title="Ajouter une opération"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span class="hidden sm:inline">Ajouter</span>
        </button>

        <button disabled class="flex items-center gap-2 px-3 py-2 bg-ui-surface-muted text-ui-content-muted/50 rounded-md border border-ui-border/50 cursor-not-allowed text-xs font-bold" title="Bientôt disponible">
          <Icon name="lucide:calendar-clock" class="w-4 h-4" />
          <span class="hidden sm:inline">Échéancier</span>
        </button>
      </div>

      <!-- Centre : Timeline (Absolue sur desktop pour centrage parfait) -->
      <div class="flex justify-center w-full xl:w-auto xl:absolute xl:left-1/2 xl:-translate-x-1/2 order-first xl:order-none mb-2 xl:mb-0">
        <div class="flex items-center gap-2 bg-ui-surface-muted/50 rounded-md p-1 border border-ui-border/50 shadow-sm">
          <button @click="emit('prev-month')" class="p-1.5 hover:bg-white rounded-md text-ui-content-muted hover:text-ui-content transition-all shadow-sm hover:shadow">
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
          </button>
          <span class="text-xs font-black uppercase tracking-widest text-ui-content min-w-[100px] text-center tabular-nums">
            {{ currentMonthLabel }}
          </span>
          <button @click="emit('next-month')" class="p-1.5 hover:bg-white rounded-md text-ui-content-muted hover:text-ui-content transition-all shadow-sm hover:shadow">
            <Icon name="lucide:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Droite : Infos Compte & Soldes -->
      <div class="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
        
        <!-- Info Compte (Discret) -->
        <div class="flex flex-col items-end mr-auto sm:mr-0">
           <h1 class="text-sm font-black text-ui-content">{{ account.name }}</h1>
           <span class="text-[10px] font-medium text-ui-content-muted uppercase tracking-wider">{{ account.bank }} • {{ account.id.substring(0, 4) }}</span>
        </div>

        <div class="h-6 w-px bg-ui-border hidden sm:block"></div>

        <!-- Soldes Compacts -->
        <div class="flex items-center gap-6">
           <div class="text-right hidden sm:block opacity-70">
              <p class="text-[9px] font-bold text-ui-content-muted uppercase tracking-wider">Pointé</p>
              <p class="text-sm font-black text-ui-content tabular-nums">
                <UiCountUp :value="balances.cleared" :currency="account.currency" />
              </p>
           </div>
           
           <div class="text-right">
              <p class="text-[9px] font-bold text-ui-content-muted uppercase tracking-wider">Actuel</p>
              <p class="text-sm font-black tabular-nums" :class="balances.current >= 0 ? 'text-emerald-600' : 'text-red-600'">
                <UiCountUp :value="balances.current" :currency="account.currency" />
              </p>
           </div>

           <div class="text-right hidden 2xl:block opacity-70">
              <p class="text-[9px] font-bold text-ui-content-muted uppercase tracking-wider">Prévu</p>
              <p class="text-sm font-black text-ui-content tabular-nums">
                <UiCountUp :value="balances.projected" :currency="account.currency" />
              </p>
           </div>
        </div>
      </div>
    </div>
</template>