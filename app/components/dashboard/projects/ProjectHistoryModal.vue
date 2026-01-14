<script setup lang="ts">
interface Project {
  name: string
}
interface ProjectTransaction {
  id: string
  date: string
  type: 'expense' | 'income'
  amount: number
}

defineProps<{
  show: boolean
  project: Project | null
  loading: boolean
  transactions: ProjectTransaction[]
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-0 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]">
      <div class="p-5 border-b border-ui-border flex items-center justify-between bg-ui-surface-muted/30">
        <div>
           <h3 class="text-lg font-black text-ui-content">Historique</h3>
           <p class="text-xs text-ui-content-muted">{{ project?.name }}</p>
        </div>
        <button @click="emit('close')"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
      </div>

      <div v-if="loading" class="p-10 flex justify-center">
         <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
      </div>

      <div v-else-if="transactions.length === 0" class="p-10 text-center text-ui-content-muted text-sm">
         Aucun mouvement récent trouvé pour ce projet.
      </div>

      <div v-else class="overflow-y-auto p-0">
         <table class="w-full text-left text-sm">
            <tbody class="divide-y divide-ui-border">
               <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-ui-surface-muted/50 transition-colors">
                  <td class="px-5 py-3 text-ui-content-muted text-xs font-bold w-24">
                     {{ new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }}
                  </td>
                  <td class="px-5 py-3">
                     <div class="font-bold text-ui-content">{{ tx.type === 'expense' ? 'Versement' : 'Retrait' }}</div>
                  </td>
                  <td class="px-5 py-3 text-right font-black tabular-nums" :class="tx.type === 'expense' ? 'text-emerald-600' : 'text-red-600'">
                     {{ tx.type === 'expense' ? '+' : '-' }}{{ Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} €
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  </UiModal>
</template>