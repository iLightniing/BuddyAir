<script setup lang="ts">
import { useAdvancedExport } from '~/composables/useAdvancedExport'

const props = defineProps<{
  show: boolean
  accounts: any[]
}>()

const emit = defineEmits(['close'])

const { 
  config, step, isExporting, processExport, 
  dataTypes, accountGroupOptions, formatOptions 
} = useAdvancedExport()

// Reset step on open
watch(() => props.show, (val) => {
  if (val) step.value = 1
})

const accountOptions = computed(() => [
  { label: 'Tous les comptes', value: 'all' },
  ...props.accounts.map(a => ({ label: a.name, value: a.id }))
])

const handleExport = async () => {
  await processExport()
  emit('close')
}
</script>

<template>
  <UiModal :show="show" @close="emit('close')">
    <div class="bg-ui-surface border border-ui-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="p-5 border-b border-ui-border flex justify-between items-center bg-ui-surface shrink-0 rounded-t-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon name="lucide:download-cloud" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-ui-content">
                {{ step === 1 ? 'Type d\'export' : 'Configuration' }}
            </h3>
            <p class="text-xs text-ui-content-muted">
                {{ step === 1 ? 'Que souhaitez-vous exporter ?' : 'Personnalisez votre fichier.' }}
            </p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 hover:bg-ui-surface-muted rounded-full transition-colors"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
      </div>

      <!-- Body -->
      <div class="flex-1 p-6 overflow-y-auto pb-20">
        <Transition name="fade" mode="out-in">
            <!-- STEP 1 : Choix du type -->
            <div v-if="step === 1" class="space-y-2">
                <button 
                    v-for="type in dataTypes" 
                    :key="type.id"
                    @click="config.dataType = type.id"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group text-left"
                    :class="config.dataType === type.id 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                      : 'bg-ui-surface border-ui-border hover:border-blue-300 hover:bg-blue-50/30'"
                >
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                        :class="config.dataType === type.id ? 'bg-blue-100 text-blue-600' : 'bg-ui-surface-muted text-ui-content-muted group-hover:bg-white group-hover:text-blue-600'"
                    >
                        <Icon :name="type.icon" class="w-5 h-5" />
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-bold text-ui-content">{{ type.label }}</div>
                        <div class="text-xs text-ui-content-muted">{{ type.desc }}</div>
                    </div>
                    <div v-if="config.dataType === type.id" class="text-blue-600"><Icon name="lucide:check-circle-2" class="w-5 h-5" /></div>
                    <Icon v-else name="lucide:chevron-right" class="w-4 h-4 text-ui-content-muted group-hover:text-blue-500 opacity-50 group-hover:opacity-100 transition-all" />
                </button>
            </div>

            <!-- STEP 2 : Configuration -->
            <div v-else class="space-y-6">
                <!-- Format -->
                <div class="space-y-3">
                    <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest">Format</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <button 
                        v-for="fmt in formatOptions" 
                        :key="fmt.value"
                        @click="config.format = fmt.value"
                        class="flex items-center gap-3 p-3 rounded-xl border transition-all text-left relative overflow-hidden"
                        :class="config.format === fmt.value 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' 
                            : 'bg-ui-surface border-ui-border text-ui-content hover:border-blue-300'"
                        >
                        <Icon :name="fmt.icon" class="w-5 h-5 shrink-0 opacity-80" />
                        <div>
                            <div class="font-bold text-sm">{{ fmt.label }}</div>
                            <div class="text-[10px] opacity-70">{{ fmt.desc }}</div>
                        </div>
                        <div v-if="config.format === fmt.value" class="absolute top-2 right-2 text-blue-600">
                            <Icon name="lucide:check-circle-2" class="w-3.5 h-3.5" />
                        </div>
                        </button>
                    </div>
                </div>

                <!-- Options CSV -->
                <div v-if="config.format === 'csv'" class="bg-ui-surface-muted/30 p-4 rounded-xl border border-ui-border space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div class="grid grid-cols-2 gap-4 relative z-20">
                        <div class="relative z-20"><UiSelect v-model="config.csvOptions.delimiter" label="Séparateur" :options="[{label: 'Point-virgule (;)', value: ';'}, {label: 'Virgule (,)', value: ','}, {label: 'Tabulation', value: 'tab'}]" /></div>
                        <div class="relative z-10"><UiSelect v-model="config.csvOptions.decimalSeparator" label="Décimales" :options="[{label: 'Virgule (10,50)', value: ','}, {label: 'Point (10.50)', value: '.'}]" /></div>
                    </div>
                    <div class="relative z-10"><UiSelect v-model="config.csvOptions.dateFormat" label="Format de date" :options="[{label: 'JJ/MM/AAAA (FR)', value: 'DD/MM/YYYY'}, {label: 'AAAA-MM-JJ (ISO)', value: 'YYYY-MM-DD'}, {label: 'MM/JJ/AAAA (US)', value: 'MM/DD/YYYY'}]" /></div>
                </div>

                <!-- Filtres -->
                <div v-if="['transactions', 'accounts', 'scheduled_transactions'].includes(config.dataType)" class="space-y-4">
                    <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest">Périmètre</h4>
                    
                    <template v-if="config.dataType === 'transactions'">
                        <div class="relative z-30"><UiSelect v-model="config.accountId" label="Compte source" :options="accountOptions" /></div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                            <div class="sm:col-span-2 relative z-20">
                                <UiSelect v-model="config.dateRange" label="Période" :options="[{label: 'Tout l\'historique', value: 'all'}, {label: 'Période personnalisée', value: 'custom'}]" />
                            </div>
                            <template v-if="config.dateRange === 'custom'">
                                <UiDate v-model="config.startDate" label="Du" />
                                <UiDate v-model="config.endDate" label="Au" />
                            </template>
                        </div>
                    </template>

                    <template v-else-if="config.dataType === 'accounts'">
                        <div class="relative z-30"><UiSelect v-model="config.accountGroup" label="Filtrer par groupe" :options="accountGroupOptions" /></div>
                    </template>

                    <template v-else-if="config.dataType === 'scheduled_transactions'">
                        <div class="relative z-30"><UiSelect v-model="config.accountId" label="Compte associé" :options="accountOptions" /></div>
                    </template>
                </div>
            </div>
        </Transition>
      </div>

      <!-- Footer -->
      <div class="p-5 border-t border-ui-border bg-ui-surface shrink-0 flex justify-between items-center rounded-b-xl">
         <UiButton v-if="step === 2" @click="step = 1" variant="secondary">
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" /> Retour
         </UiButton>
         <UiButton v-else @click="emit('close')" variant="secondary">Annuler</UiButton>

         <UiButton v-if="step === 1" @click="step = 2" class="shadow-lg shadow-blue-500/20 px-6">
            Suivant <Icon name="lucide:arrow-right" class="w-4 h-4 ml-2" />
         </UiButton>
         <UiButton v-else @click="handleExport" :loading="isExporting" class="shadow-lg shadow-blue-500/20 px-6">
            <Icon name="lucide:download" class="w-4 h-4 mr-2" />
            Exporter
         </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>