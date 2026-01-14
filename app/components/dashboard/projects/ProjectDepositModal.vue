<script setup lang="ts">
interface Project {
  name: string
}
interface AccountOption {
  label: string
  value: string
}

const props = defineProps<{
  show: boolean
  project: Project | null
  accountOptions: AccountOption[]
}>()

const amount = defineModel<string>('amount')
const account = defineModel<string>('account')
const type = defineModel<'deposit' | 'withdraw'>('type')

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-sm w-full">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-ui-content">Gérer l'épargne</h3>
        <button @click="emit('close')"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
      </div>

      <!-- Tabs -->
      <div class="flex p-1 bg-ui-surface-muted rounded-lg mb-6">
         <button @click="type = 'deposit'" class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" :class="type === 'deposit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-ui-content-muted hover:text-ui-content'">Verser</button>
         <button @click="type = 'withdraw'" class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" :class="type === 'withdraw' ? 'bg-white text-red-600 shadow-sm' : 'text-ui-content-muted hover:text-ui-content'">Retirer</button>
      </div>

      <div class="mb-6 text-center">
         <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors" :class="type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
            <Icon :name="type === 'deposit' ? 'lucide:piggy-bank' : 'lucide:hand-coins'" class="w-6 h-6" />
         </div>
         <p class="text-sm text-ui-content-muted">Combien souhaitez-vous {{ type === 'deposit' ? 'verser sur' : 'retirer de' }} <br><span class="font-bold text-ui-content">{{ project?.name }}</span> ?</p>
      </div>

      <form @submit.prevent="emit('confirm')" class="space-y-4">
        <div class="relative">
           <input v-model="amount" type="number" step="0.01" placeholder="0.00" class="w-full text-center text-3xl font-black bg-transparent border-b-2 border-ui-border outline-none py-2 tabular-nums placeholder:text-ui-content-muted/20 transition-colors" :class="type === 'deposit' ? 'text-emerald-600 focus:border-emerald-500' : 'text-red-600 focus:border-red-500'" autofocus />
           <span class="absolute right-8 top-1/2 -translate-y-1/2 text-ui-content-muted font-bold pointer-events-none">€</span>
        </div>
        <div>
           <UiSelect v-model="account" label="Depuis le compte" :options="accountOptions" placeholder="Choisir un compte..." />
        </div>
        <div class="pt-4 flex gap-3">
          <UiButton type="button" @click="emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton type="submit" class="flex-1 text-white shadow-xl transition-all" :class="type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 shadow-emerald-500/20' : 'bg-red-600 hover:bg-red-700 border-red-700 shadow-red-500/20'">
             {{ type === 'deposit' ? 'Verser' : 'Retirer' }}
          </UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>