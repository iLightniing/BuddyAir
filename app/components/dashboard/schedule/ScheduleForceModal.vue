<script setup lang="ts">
const monthOptions = [
  { label: 'Janvier', value: 0 }, { label: 'Février', value: 1 }, { label: 'Mars', value: 2 },
  { label: 'Avril', value: 3 }, { label: 'Mai', value: 4 }, { label: 'Juin', value: 5 },
  { label: 'Juillet', value: 6 }, { label: 'Août', value: 7 }, { label: 'Septembre', value: 8 },
  { label: 'Octobre', value: 9 }, { label: 'Novembre', value: 10 }, { label: 'Décembre', value: 11 }
]

defineProps<{
  show: boolean
  loading: boolean
}>()

const month = defineModel<number>('month')
const year = defineModel<number>('year')

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <UiModal :show="show">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-md shadow-2xl max-w-sm w-full">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
          <Icon name="lucide:calendar-plus" class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-black text-ui-content tracking-tight">Forcer l'échéance</h3>
      </div>
      <p class="text-sm text-ui-content-muted mb-6">Générer manuellement cette transaction pour un mois spécifique.</p>
      <div class="grid grid-cols-2 gap-4 mb-6">
         <UiSelect v-model="month" label="Mois" :options="monthOptions" />
         <UiInput v-model="year" label="Année" type="number" />
      </div>
      <div class="flex gap-3">
        <UiButton @click="emit('close')" variant="secondary" class="flex-1">Annuler</UiButton>
        <UiButton @click="emit('confirm')" :disabled="loading" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xl shadow-emerald-500/20">Générer</UiButton>
      </div>
    </div>
  </UiModal>
</template>