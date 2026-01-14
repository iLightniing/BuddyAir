<script setup lang="ts">
import { useScheduleForm } from '~/composables/useScheduleForm'
const props = defineProps<{ 
  show: boolean, 
  item?: any,
  preselectedAccountId?: string
}>()
const emit = defineEmits(['close', 'success'])

const { form, loading, accounts, handleSubmit } = useScheduleForm(props, emit)

const frequencies = [
  { label: 'Mensuel', value: 'monthly' },
  { label: 'Bimestriel', value: 'bimonthly' },
  { label: 'Trimestriel', value: 'quarterly' },
  { label: 'Semestriel', value: 'semiannual' },
  { label: 'Annuel', value: 'yearly' }
]

const typeOptions = [
  { label: 'Dépense', value: 'expense', activeClass: 'bg-red-50 text-red-600 border-red-200 shadow-sm' },
  { label: 'Revenu', value: 'income', activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' }
]

const { categories, fetchCategories, categoryOptions } = useCategories()

onMounted(fetchCategories)

const subCategoryOptions = computed(() => {
  const category = form.value.category
  const cat = categories.value.find(c => c.name === category)
  return cat && cat.sub_categories ? cat.sub_categories.map((s: string) => ({ label: s, value: s })) : []
})
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-ui-content tracking-tight">
          {{ item ? 'Modifier l\'échéance' : 'Nouvelle échéance' }}
        </h3>
        <button @click="emit('close')" class="text-ui-content-muted hover:text-ui-content transition-colors">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <!-- Colonne Gauche : Infos -->
          <div class="md:col-span-7 space-y-6">
            <!-- Type -->
            <div class="grid grid-cols-2 gap-1 p-1 bg-ui-surface-muted rounded-lg border border-ui-border h-[40px]">
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

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4">
              <UiDate v-model="form.start_date" label="Date de début" required />
              <UiDate v-model="form.end_date" label="Date de fin (Optionnel)" />
            </div>

            <!-- Account -->
            <UiSelect v-model="form.account" label="Compte à débiter" :options="accounts" placeholder="Choisir un compte..." />

            <!-- Category & Sub-category -->
            <div class="grid grid-cols-2 gap-4">
              <UiSelect v-model="form.category" label="Catégorie" :options="categoryOptions" />
              <UiSelect v-model="form.sub_category" label="Sous-catégorie" :options="subCategoryOptions" placeholder="Sélectionner..." />
            </div>

            <!-- Description -->
            <UiInput v-model="form.description" label="Description" placeholder="Ex: Abonnement Netflix" required />

            <!-- Amount -->
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
          </div>

          <!-- Colonne Droite : Fréquence -->
          <div class="md:col-span-5">
            <div class="bg-ui-surface-muted/30 border border-ui-border rounded-xl p-5 space-y-6 h-full flex flex-col">
              <h4 class="text-xs font-black text-ui-content uppercase tracking-widest">Fréquence de prélèvement</h4>
              
              <UiSelect v-model="form.frequency" label="Périodicité" :options="frequencies" />
              
              <div class="space-y-2 flex-1">
                <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Jour du mois</label>
                <div class="grid grid-cols-7 gap-1">
                  <button 
                    v-for="d in 31" 
                    :key="d"
                    type="button"
                    @click="form.day_of_month = d"
                    class="h-8 rounded-md text-xs font-bold transition-all flex items-center justify-center"
                    :class="form.day_of_month === d ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-ui-surface border border-ui-border text-ui-content hover:border-blue-400'"
                  >
                    {{ d }}
                  </button>
                </div>
              </div>

              <div class="pt-4 border-t border-ui-border/50 mt-auto">
                <UiSwitch v-model="form.shift_weekends" label="Décalage jours ouvrés (si week-end/férié)" />
              </div>
              
              <div v-if="!item" class="pt-2">
                <UiSwitch v-model="form.generate_now" label="Prendre effet immédiatement (ce mois-ci)" />
              </div>
            </div>
          </div>
        </div>

        <div class="pt-6 mt-2">
          <UiButton type="submit" :disabled="loading" class="w-full shadow-xl shadow-blue-500/10 py-3">
            {{ loading ? 'Enregistrement...' : 'Valider l\'échéance' }}
          </UiButton>
        </div>
      </form>
    </div>
  </UiModal>
</template>