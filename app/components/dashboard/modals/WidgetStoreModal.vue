<script setup lang="ts">
const props = defineProps<{
  show: boolean
  activeWidgets: string[]
}>()

const emit = defineEmits(['close', 'update:widgets'])

const availableWidgets = [
  { id: 'TotalBalance', name: 'Solde Total', description: 'Aperçu global de vos finances', icon: 'lucide:wallet' },
  { id: 'LastVisit', name: 'Dernière Visite', description: 'Date de votre dernière connexion', icon: 'lucide:clock' },
  { id: 'Situation', name: 'Situation', description: 'Graphique de répartition', icon: 'lucide:pie-chart' },
  { id: 'AccountsList', name: 'Mes Comptes', description: 'Liste détaillée de vos comptes', icon: 'lucide:credit-card' },
  { id: 'RecentTransactions', name: 'Transactions', description: 'Dernières opérations', icon: 'lucide:arrow-right-left' },
  { id: 'UpcomingSchedules', name: 'Échéances', description: 'Prochains prélèvements', icon: 'lucide:calendar' },
  { id: 'MonthlyBudget', name: 'Budget Mensuel', description: 'Suivi de vos dépenses vs limites', icon: 'lucide:piggy-bank' },
  { id: 'SavingsGoals', name: 'Objectifs', description: 'Progression de vos projets d\'épargne', icon: 'lucide:target' },
  { id: 'CashFlow', name: 'Flux de Trésorerie', description: 'Comparatif Entrées / Sorties', icon: 'lucide:trending-up' },
]

const selected = ref<string[]>([])

watch(() => props.show, (val) => {
  if (val) selected.value = [...props.activeWidgets]
})

const toggleWidget = (id: string) => {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter(w => w !== id)
  } else {
    selected.value.push(id)
  }
}

const save = () => {
  emit('update:widgets', selected.value)
  emit('close')
}
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-2xl w-full">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-black text-ui-content">Galerie de Widgets</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-ui-surface-muted rounded-full transition-colors">
          <Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" />
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div 
          v-for="widget in availableWidgets" 
          :key="widget.id"
          @click="toggleWidget(widget.id)"
          class="p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-4 group"
          :class="selected.includes(widget.id) 
            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
            : 'bg-ui-surface border-ui-border hover:border-blue-300 hover:shadow-md'"
        >
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
               :class="selected.includes(widget.id) ? 'bg-blue-100 text-blue-600' : 'bg-ui-surface-muted text-ui-content-muted group-hover:bg-blue-50 group-hover:text-blue-500'">
            <Icon :name="widget.icon" class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <h4 class="font-bold text-sm text-ui-content">{{ widget.name }}</h4>
              <div class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                   :class="selected.includes(widget.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'">
                <Icon v-if="selected.includes(widget.id)" name="lucide:check" class="w-3 h-3 text-white" />
              </div>
            </div>
            <p class="text-xs text-ui-content-muted">{{ widget.description }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <UiButton variant="secondary" @click="$emit('close')">Annuler</UiButton>
        <UiButton @click="save">Enregistrer mon tableau de bord</UiButton>
      </div>
    </div>
  </UiModal>
</template>