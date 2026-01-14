<script setup lang="ts">
const props = defineProps<{
  show: boolean
  schedule: any[]
  analysis: any
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between mb-6 shrink-0">
        <div>
           <h3 class="text-xl font-black text-ui-content tracking-tight">Tableau d'amortissement</h3>
           <p v-if="analysis" class="text-xs text-ui-content-muted">Coût total : <span class="font-bold text-red-500">{{ analysis.totalCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span> (Intérêts: {{ analysis.totalInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }} | Assurance: {{ analysis.totalInsurance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }})</p>
        </div>
        <button @click="emit('close')" class="text-ui-content-muted hover:text-ui-content transition-colors">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <div class="overflow-y-auto flex-1 border border-ui-border rounded-xl">
        <table class="w-full text-left border-collapse text-sm">
          <thead class="sticky top-0 bg-ui-surface-muted z-10">
            <tr>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px]">Date</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Mensualité</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Intérêts</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Capital</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Assurance</th>
              <th class="p-3 font-black text-ui-content-muted uppercase tracking-widest text-[10px] text-right">Restant dû</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ui-border">
            <tr v-for="row in schedule" :key="row.id" class="hover:bg-ui-surface-muted/50 transition-colors" :class="row.isPast ? 'opacity-50 bg-ui-surface-muted/20' : ''">
              <td class="p-3 font-medium text-ui-content tabular-nums">
                {{ row.date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) }}
              </td>
              <td class="p-3 text-right font-bold text-ui-content tabular-nums">
                {{ row.payment.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right text-orange-500 tabular-nums">
                {{ row.interest.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right text-emerald-600 tabular-nums">
                {{ row.principal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right text-blue-500 tabular-nums">
                {{ row.insurance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
              <td class="p-3 text-right font-bold text-ui-content tabular-nums">
                {{ row.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </UiModal>
</template>