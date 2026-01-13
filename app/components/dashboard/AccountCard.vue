<script setup lang="ts">
const props = defineProps<{
  account: any
  isEditMode: boolean
}>()

const emit = defineEmits(['edit', 'delete'])

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
      isEditMode ? 'shake-animation cursor-grab active:cursor-grabbing drag-handle' : 'hover:-translate-y-1 hover:shadow-xl cursor-pointer',
      'bg-ui-surface border-ui-border text-ui-content shadow-sm hover:border-blue-300/50'
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
          <span class="text-[10px] font-black uppercase tracking-widest text-ui-content-muted">{{ account.bank }}</span>
          <div class="flex items-center gap-2 mt-1">
            <Icon name="lucide:nfc" class="w-5 h-5 text-ui-content-muted/70" />
            <Icon name="lucide:wifi" class="w-4 h-4 text-ui-content-muted/50 rotate-90" />
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
        <div v-else class="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border"
          :class="account.current_balance >= 0 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-600'">
          <Icon :name="account.account_group === 'savings' ? 'lucide:piggy-bank' : 'lucide:credit-card'" class="w-5 h-5" />
        </div>
      </div>

      <!-- Balance -->
      <div class="mt-6">
        <p class="text-xs font-medium text-ui-content-muted mb-1">Solde actuel</p>
        <p class="text-3xl font-black tracking-tight tabular-nums text-ui-content" :class="account.current_balance < 0 ? 'text-red-600' : ''">
          {{ account.current_balance.toLocaleString('fr-FR', { style: 'currency', currency: account.currency }) }}
        </p>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-ui-border flex justify-between items-center">
        <div class="flex flex-col min-w-0">
          <h3 class="font-bold text-sm truncate text-ui-content">{{ account.name }}</h3>
          <span class="text-xs font-mono text-ui-content-muted tracking-wider">•••• {{ account.id.substring(0, 4) }}</span>
        </div>
        <Icon v-if="!isEditMode" name="lucide:chevron-right" class="w-5 h-5 text-ui-content-muted group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
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