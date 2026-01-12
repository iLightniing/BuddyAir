<script setup lang="ts">
const props = defineProps<{
  transactions: any[]
  loading: boolean
  selectedTransactions: string[]
  currency: string
}>()

const emit = defineEmits(['update:selectedTransactions', 'edit', 'delete', 'toggle-pointed'])

const methodIcons: Record<string, string> = {
  card: 'lucide:credit-card',
  transfer: 'lucide:arrow-right-left',
  direct_debit: 'lucide:landmark',
  cash: 'lucide:banknote',
  check: 'lucide:scroll-text',
  other: 'lucide:more-horizontal'
}

const methodLabels: Record<string, string> = {
  card: 'Carte',
  transfer: 'Virement',
  direct_debit: 'Prélèvement',
  cash: 'Espèces',
  check: 'Chèque',
  other: 'Autre'
}

const allSelected = computed(() => {
  return props.transactions.length > 0 && props.selectedTransactions.length === props.transactions.length
})

const toggleAll = (checked?: boolean) => {
  if (checked) {
    emit('update:selectedTransactions', props.transactions.map(tx => tx.id))
  } else {
    emit('update:selectedTransactions', [])
  }
}

const toggleSelection = (id: string, checked?: boolean) => {
  const newSelection = [...props.selectedTransactions]
  if (checked) newSelection.push(id)
  else {
    const index = newSelection.indexOf(id)
    if (index > -1) newSelection.splice(index, 1)
  }
  emit('update:selectedTransactions', newSelection)
}
</script>

<template>
    <div class="bg-ui-surface border border-ui-border rounded-md shadow-sm overflow-hidden">
      <div v-if="loading" class="p-20 flex justify-center">
        <Icon name="lucide:loader-2" class="w-10 h-10 text-blue-500 animate-spin" />
      </div>
      
      <div v-else-if="transactions.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-ui-border bg-ui-surface-muted/50">
              <th class="p-3 pl-6 w-12 text-center">
                <UiCheckbox :model-value="allSelected" @update:model-value="toggleAll" />
              </th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest w-28">Date</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest">Description</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest w-24">Type</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">Débit</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">Crédit</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-center w-16">Pointé</th>
              <th class="p-3 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-28">Solde</th>
              <th class="p-3 pr-6 text-[10px] font-black text-ui-content-muted uppercase tracking-widest text-right w-20">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ui-border">
            <tr v-for="tx in transactions" :key="tx.id" class="group hover:bg-white hover:shadow-lg hover:z-10 relative transition-all duration-200">
              <td class="p-3 pl-6 align-top text-center">
                <UiCheckbox :model-value="selectedTransactions.includes(tx.id)" @update:model-value="(val) => toggleSelection(tx.id, val)" />
              </td>
              <!-- Date -->
              <td class="p-3 text-sm font-bold text-ui-content-muted tabular-nums align-top whitespace-nowrap">
                <div class="flex flex-col">
                  <span>{{ new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }}</span>
                  <span v-if="tx.pointed_at" class="text-[10px] text-emerald-600 font-medium mt-0.5">
                    Validé le {{ new Date(tx.pointed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }}
                  </span>
                </div>
              </td>
              
              <!-- Description & Catégorie -->
              <td class="p-3 align-top">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-bold text-ui-content">{{ tx.description || 'Sans description' }}</span>
                  <div class="flex items-center gap-2">
                    <span class="inline-flex self-start items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-ui-surface-muted border border-ui-border text-ui-content-muted">
                      {{ tx.category }}
                    </span>
                    <span v-if="tx.sub_category" class="flex items-center gap-1 text-[10px] text-ui-content-muted font-medium">
                      <Icon name="lucide:chevron-right" class="w-3 h-3 opacity-50" />
                      {{ tx.sub_category }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="p-3 align-top">
                <div class="flex items-center gap-2" :title="tx.payment_method">
                  <div class="w-6 h-6 rounded-md flex items-center justify-center bg-ui-surface-muted text-ui-content-muted">
                    <Icon :name="methodIcons[tx.payment_method] || 'lucide:more-horizontal'" class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-xs font-medium text-ui-content-muted hidden xl:inline-block capitalize">
                    {{ methodLabels[tx.payment_method] || tx.payment_method }}
                  </span>
                </div>
              </td>

              <!-- Débit -->
              <td class="p-3 text-right font-black tabular-nums text-sm text-red-600 align-top whitespace-nowrap">
                <span v-if="tx.type === 'expense'">-{{ tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
              </td>

              <!-- Crédit -->
              <td class="p-3 text-right font-black tabular-nums text-sm text-emerald-600 align-top whitespace-nowrap">
                <span v-if="tx.type === 'income'">+{{ tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
              </td>

              <!-- Pointé -->
              <td class="p-3 text-center align-top">
                <div class="flex justify-center">
                  <UiCheckbox :model-value="tx.status === 'completed'" @update:model-value="(val) => emit('toggle-pointed', tx, val)" />
                </div>
              </td>

              <!-- Solde -->
              <td class="p-3 text-right font-bold tabular-nums text-sm align-top whitespace-nowrap" :class="tx.running_balance >= 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ tx.running_balance.toLocaleString('fr-FR', { style: 'currency', currency: currency }) }}
              </td>

              <!-- Action -->
              <td class="p-3 pr-6 text-right align-top">
                <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="emit('edit', tx)" class="w-8 h-8 flex items-center justify-center hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                    <Icon name="lucide:pencil" class="w-4 h-4" />
                  </button>
                  <button @click="emit('delete', tx)" class="w-8 h-8 flex items-center justify-center hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-20 h-20 bg-ui-surface-muted rounded-3xl flex items-center justify-center mb-6 text-ui-content-muted/20">
          <Icon name="lucide:receipt" class="w-10 h-10" />
        </div>
        <h3 class="text-xl font-black text-ui-content mb-2">Aucune opération</h3>
        <p class="text-ui-content-muted text-sm max-w-xs mx-auto mb-8">Ce compte est bien calme... Ajoutez votre première dépense ou revenu.</p>
        <UiButton @click="emit('edit', null)" variant="secondary">
          Ajouter une opération
        </UiButton>
      </div>
    </div>
</template>