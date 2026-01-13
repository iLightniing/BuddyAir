<script setup lang="ts">
const props = defineProps<{
  account: any
  currentDate: Date
  balances: { current: number, cleared: number, projected: number }
}>()

const emit = defineEmits(['prev-month', 'next-month'])

const currentMonthLabel = computed(() => {
  return props.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm">
    
    <!-- Desktop Layout -->
    <div class="hidden md:flex items-center justify-between gap-4">
      <!-- Gauche: Retour, Titre, Actions -->
      <div class="flex items-center gap-2">
        <NuxtLink to="/dashboard/accounts" class="w-10 h-10 flex items-center justify-center bg-ui-surface hover:bg-ui-surface-muted border border-ui-border rounded-xl text-ui-content transition-all shadow-sm">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
      </div>

      <!-- Milieu: Timeline -->
      <div class="flex items-center bg-ui-surface-muted/50 rounded-full p-1 border border-ui-border/50">
          <button @click="emit('prev-month')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-ui-content-muted hover:text-ui-content transition-all">
              <Icon name="lucide:chevron-left" class="w-4 h-4" />
          </button>
          <span class="px-4 text-xs font-black text-ui-content capitalize min-w-[100px] text-center">{{ currentMonthLabel }}</span>
          <button @click="emit('next-month')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-ui-content-muted hover:text-ui-content transition-all">
              <Icon name="lucide:chevron-right" class="w-4 h-4" />
          </button>
      </div>

      <!-- Droite: Soldes -->
      <div class="flex items-center gap-3">
        <div class="text-right">
           <p class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest">Pointé</p>
           <p class="text-sm font-bold text-ui-content">{{ balances.cleared.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</p>
        </div>
        <div class="text-right px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-lg">
           <p class="text-[9px] font-black text-blue-600 uppercase tracking-widest">Actuel</p>
           <p class="text-xl font-black text-blue-700">{{ balances.current.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</p>
        </div>
        <div class="text-right">
           <p class="text-[9px] font-black text-ui-content-muted uppercase tracking-widest">Prévu</p>
           <p class="text-sm font-bold text-ui-content">{{ balances.projected.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}</p>
        </div>
      </div>
    </div>

    <!-- Mobile Layout (Preserved) -->
    <div class="md:hidden flex items-center justify-between gap-2">
        <NuxtLink to="/dashboard/accounts" class="w-10 h-10 flex items-center justify-center -ml-2 bg-ui-surface hover:bg-ui-surface-muted border border-ui-border rounded-xl text-ui-content transition-all shadow-sm">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>

        <div class="flex items-center bg-ui-surface-muted/50 rounded-full p-1 border border-ui-border/50">
            <button @click="emit('prev-month')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-ui-content-muted hover:text-ui-content transition-all">
                <Icon name="lucide:chevron-left" class="w-4 h-4" />
            </button>
            <span class="px-2 text-xs font-black text-ui-content capitalize min-w-[90px] text-center truncate">{{ currentMonthLabel }}</span>
            <button @click="emit('next-month')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-ui-content-muted hover:text-ui-content transition-all">
                <Icon name="lucide:chevron-right" class="w-4 h-4" />
            </button>
        </div>
    </div>
  </div>
</template>