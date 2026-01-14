<script setup lang="ts">
import { useTags } from '~/composables/useTags'

const props = defineProps<{
  show: boolean
  transactions: any[]
  currency: string
}>()

const emit = defineEmits(['close'])

const { tags, fetchTags, getTagClass } = useTags()

onMounted(fetchTags)

const selectedTagId = ref<string | null>(null)

const tagStats = computed(() => {
  const stats: Record<string, { id: string, name: string, color: string, count: number, amount: number }> = {}
  
  props.transactions.forEach(tx => {
    if (tx.tags && tx.tags.length > 0) {
      tx.tags.forEach((tagId: string) => {
        if (!stats[tagId]) {
          const tagDef = tags.value.find(t => t.id === tagId)
          if (tagDef) {
            stats[tagId] = {
              id: tagId,
              name: tagDef.name,
              color: tagDef.color,
              count: 0,
              amount: 0
            }
          }
        }
        
        if (stats[tagId]) {
          stats[tagId].count++
          // On additionne les montants (négatif pour dépense, positif pour revenu)
          const amount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
          stats[tagId].amount += amount
        }
      })
    }
  })
  
  return Object.values(stats).sort((a, b) => a.amount - b.amount) // Tri par montant (les plus grosses dépenses en premier)
})

// Sélectionner le premier tag par défaut
watch(tagStats, (newStats) => {
  if (newStats[0] && !selectedTagId.value) {
    selectedTagId.value = newStats[0].id
  }
}, { immediate: true })

const selectedTransactions = computed(() => {
  if (!selectedTagId.value) return []
  return props.transactions
    .filter(tx => tx.tags && tx.tags.includes(selectedTagId.value))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: props.currency }).format(value)
}
</script>

<template>
  <UiModal :show="show" @close="emit('close')">
    <div class="bg-ui-surface border border-ui-border rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[600px]">
      <div class="p-6 border-b border-ui-border flex justify-between items-center bg-ui-surface-muted/30 rounded-t-2xl shrink-0">
        <h3 class="text-xl font-black text-ui-content">Analyse des Tags</h3>
        <button @click="emit('close')"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
      </div>
      
      <div class="flex flex-1 overflow-hidden">
        <!-- Colonne Gauche : Liste des Tags -->
        <div class="w-1/3 border-r border-ui-border overflow-y-auto custom-scrollbar bg-ui-surface-muted/10">
            <div v-if="tagStats.length === 0" class="p-6 text-center text-ui-content-muted text-sm">
               Aucune transaction taguée.
            </div>
            <div v-else class="divide-y divide-ui-border">
               <button 
                  v-for="stat in tagStats" 
                  :key="stat.id"
                  @click="selectedTagId = stat.id"
                  class="w-full text-left p-4 hover:bg-ui-surface-muted transition-colors flex flex-col gap-2 group border-l-4"
                  :class="selectedTagId === stat.id ? 'bg-blue-50/50 border-l-blue-500' : 'border-l-transparent'"
               >
                  <div class="flex justify-between items-center w-full">
                     <span class="px-2 py-1 rounded-md text-xs font-bold border" :class="getTagClass(stat.color)">
                        # {{ stat.name }}
                     </span>
                     <span class="text-xs text-ui-content-muted">{{ stat.count }} op.</span>
                  </div>
                  <div class="flex justify-between items-center w-full">
                     <span class="text-xs text-ui-content-muted">Total</span>
                     <span class="font-black text-sm tabular-nums" :class="stat.amount >= 0 ? 'text-emerald-600' : 'text-red-600'">
                        {{ stat.amount > 0 ? '+' : '' }}{{ formatCurrency(stat.amount) }}
                     </span>
                  </div>
               </button>
            </div>
        </div>

        <!-- Colonne Droite : Détail des transactions -->
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-ui-surface p-6">
            <div v-if="selectedTagId && selectedTransactions.length > 0" class="space-y-4">
                <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 sticky top-0 bg-ui-surface py-2 z-10 border-b border-ui-border">
                    Détails des opérations
                </h4>
                <div v-for="tx in selectedTransactions" :key="tx.id" class="flex items-center justify-between py-3 border-b border-ui-border/50 last:border-0 hover:bg-ui-surface-muted/30 px-2 rounded-lg transition-colors">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-sm font-bold text-ui-content">{{ tx.description }}</span>
                        <span class="text-[10px] text-ui-content-muted">{{ new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
                    </div>
                    <span class="font-bold text-sm tabular-nums" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'">
                        {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                    </span>
                </div>
            </div>
            <div v-else class="h-full flex flex-col items-center justify-center text-ui-content-muted">
                <Icon name="lucide:mouse-pointer-click" class="w-8 h-8 mb-2 opacity-50" />
                <p class="text-sm">Sélectionnez un tag pour voir le détail.</p>
            </div>
        </div>
      </div>
    </div>
  </UiModal>
</template>