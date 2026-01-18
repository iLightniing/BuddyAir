<script setup lang="ts">
import { useTransactionForm } from '~/composables/useTransactionForm'
import { useRules } from '~/composables/useRules'
import { useTags } from '~/composables/useTags'

const props = defineProps<{ 
  show: boolean, 
  transaction?: any,
  initialData?: any,
  accountId: string,
  accountGroup?: string
}>()
const emit = defineEmits(['close', 'success', 'delete'])

const { form, loading, handleSubmit, availableAccounts, isInitializing } = useTransactionForm(props, emit)

const { categories, fetchCategories, categoryOptions } = useCategories()
const { fetchPaymentMethods, paymentMethods } = usePaymentMethods()
const { applyRules, fetchRules } = useRules()
const { tags, fetchTags, getTagClass } = useTags()

onMounted(() => { 
  fetchCategories()
  fetchPaymentMethods()
  fetchRules()
  fetchTags()
})

const subCategoryOptions = computed(() => {
  const category = form.value.category
  const cat = categories.value.find(c => c.name === category)
  // On gère le cas où sub_categories est un tableau de chaînes
  return cat && cat.sub_categories ? cat.sub_categories.map((s: string) => ({ label: s, value: s })) : []
})

const typeOptions = computed(() => {
  if (props.accountGroup === 'credit') {
    return [
      { label: 'Remboursement', value: 'income', activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' },
      { label: 'Frais / Déblocage', value: 'expense', activeClass: 'bg-red-50 text-red-600 border-red-200 shadow-sm' }
    ]
  }
  if (props.accountGroup === 'savings') {
    return [
      { label: 'Dépôt', value: 'income', activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' },
      { label: 'Retrait', value: 'expense', activeClass: 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm' }
    ]
  }
  return [
    { label: 'Dépense', value: 'expense', activeClass: 'bg-red-50 text-red-600 border-red-200 shadow-sm' },
    { label: 'Revenu', value: 'income', activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' }
  ]
})

const filteredPaymentMethodOptions = computed(() => {
  const currentType = form.value.type // 'expense' ou 'income'
  const methods = paymentMethods.value || []

  return methods
    .filter((m: any) => {
      // Suppression explicite de "Autre" si présent
      if (m.name === 'Autre' || m.code === 'other') return false

      const mType = m.type || 'both' // Par défaut 'both' si non défini
      if (mType === 'both') return true
      if (currentType === 'expense' && mType === 'debit') return true
      if (currentType === 'income' && mType === 'credit') return true
      return false
    })
    .map((m: any) => ({ label: m.name, value: m.code }))
})

// Réinitialiser la sous-catégorie si la catégorie change (sauf à l'initialisation)
watch(() => form.value.category, () => {
  if (!isInitializing.value) {
    form.value.sub_category = ''
  }
})

// Force le mode virement pour les remboursements de crédit
watch(() => form.value.type, (newType) => {
  if (props.accountGroup === 'credit' && newType === 'income') {
    form.value.payment_method = 'transfer'
  }
})

// Application des règles d'automatisation lors de la saisie de la description
watch(() => form.value.description, (newVal) => {
  if (!newVal) return
  const match = applyRules(newVal)
  if (match) {
    form.value.category = match.category
    form.value.sub_category = match.sub_category || ''
  }
})

const toggleTag = (tagId: string) => {
  const index = form.value.tags.indexOf(tagId)
  if (index === -1) form.value.tags.push(tagId)
  else form.value.tags.splice(index, 1)
}
</script>

<template>
  <UiModal :show="show" @close="emit('close')">
    <div class="bg-ui-surface border border-ui-border p-4 sm:p-6 rounded-2xl shadow-2xl w-full sm:max-w-3xl">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-ui-content tracking-tight">
          {{ transaction ? 'Modifier l\'opération' : 'Nouvelle opération' }}
        </h3>
        <button @click="emit('close')" class="text-ui-content-muted hover:text-ui-content transition-colors">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Ligne 1 : Type & Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Type</label>
            <div class="grid grid-cols-2 gap-1 p-1 bg-ui-surface-muted rounded-lg border border-ui-border h-[52px]">
              <button 
                v-for="opt in typeOptions" 
                :key="opt.value"
                type="button"
                @click="form.type = opt.value"
                class="flex items-center justify-center text-sm font-bold rounded-md transition-all border border-transparent"
                :class="form.type === opt.value ? opt.activeClass + ' shadow-sm' : 'text-ui-content-muted hover:text-ui-content hover:bg-white/50'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UiDate v-model="form.date" label="Date" required />
            <UiDate v-model="form.pointed_at" label="Pointage" />
          </div>
        </div>

        <!-- Ligne 2 : Montant & Paiement -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1 mb-2 block">Montant</label>
            <div class="relative group">
              <input 
                v-model="form.amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                required
                class="w-full text-3xl font-black bg-transparent border-b-2 border-ui-border focus:border-blue-500 outline-none py-1 px-1 tabular-nums transition-colors placeholder:text-ui-content-muted/20"
                :class="form.type === 'expense' ? 'text-red-600' : 'text-emerald-600'"
              />
              <span class="absolute right-0 top-1/2 -translate-y-1/2 text-ui-content-muted font-bold pointer-events-none">EUR</span>
            </div>
          </div>
          <UiSelect v-if="!(accountGroup === 'credit' && form.type === 'income')" v-model="form.payment_method" label="Moyen de paiement" :options="filteredPaymentMethodOptions" />
        </div>

        <!-- Virement : Compte cible -->
        <div v-if="form.payment_method === 'transfer' && !transaction" class="animate-in slide-in-from-top-2 fade-in duration-200">
          <UiSelect v-model="form.transfer_account" :label="accountGroup === 'credit' ? 'Depuis le compte (Débit)' : 'Vers le compte'" :options="availableAccounts" placeholder="Sélectionner un compte..." />
        </div>

        <!-- Ligne 3 : Catégorisation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UiSelect v-model="form.category" label="Catégorie" :options="categoryOptions" />
          <UiSelect v-model="form.sub_category" label="Sous-catégorie" :options="subCategoryOptions" placeholder="Sélectionner..." />
        </div>

        <!-- Ligne 4 : Description -->
        <div class="space-y-6">
          <UiInput v-model="form.description" label="Description" placeholder="Ex: Courses Carrefour" />
        </div>

        <!-- Ligne 5 : Tags -->
        <div v-if="tags.length > 0" class="space-y-2">
           <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Tags</label>
           <div class="flex flex-wrap gap-2">
              <button 
                v-for="tag in tags" 
                :key="tag.id" 
                type="button"
                @click="toggleTag(tag.id)"
                class="px-3 py-1 rounded-full text-xs font-bold border transition-all"
                :class="form.tags.includes(tag.id) ? getTagClass(tag.color) + ' ring-2 ring-offset-1 ring-blue-500/30' : 'bg-ui-surface border-ui-border text-ui-content-muted hover:border-blue-300'"
              >
                 #{{ tag.name }}
              </button>
           </div>
        </div>

        <div class="pt-2 flex gap-3">
          <UiButton type="submit" :loading="loading" class="flex-1 shadow-xl shadow-blue-500/10 py-3">
            {{ loading ? 'Enregistrement...' : 'Valider l\'opération' }}
          </UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>