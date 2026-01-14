<script setup lang="ts">
import { useDataImport } from '~/composables/useDataImport'

const props = defineProps<{
  show: boolean
  accounts: any[] // Liste des comptes pour choisir la cible
}>()

const emit = defineEmits(['close', 'success'])

const { 
  isImporting, parsedData, headers, mapping, mappingOptions, isMappingValid,
  step, selectedFile, targetAccountId,
  parseCSV, processImport, progress, importStats, reset
} = useDataImport()

const fileInput = ref<HTMLInputElement | null>(null)
const accountOptions = computed(() => props.accounts.map(a => ({ label: a.name, value: a.id })))

const handleFileDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file && file.type === 'text/csv') {
    selectedFile.value = file
    await parseCSV(file)
    step.value = 2
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    await parseCSV(target.files[0])
    step.value = 2
  }
}

const confirmImport = async () => {
  step.value = 3 // Passage à l'étape de progression
  const success = await processImport(targetAccountId.value)
  if (success) {
    emit('success')
    // On reste sur l'étape 3 pour afficher le succès
  } else {
    // En cas d'erreur critique (non gérée par importStats), on pourrait vouloir revenir en arrière ou fermer
  }
}

const finish = () => {
    emit('close')
    reset()
}

const closeAndReset = () => {
  emit('close')
  // Petit délai pour que la modale se ferme avant de réinitialiser
  setTimeout(reset, 300)
}
</script>

<template>
  <UiModal :show="show" @close="closeAndReset">
    <div class="bg-ui-surface border border-ui-border rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-6 border-b border-ui-border flex justify-between items-center bg-ui-surface-muted/30 rounded-t-2xl">
        <div>
          <h3 class="text-xl font-black text-ui-content">Assistant d'importation</h3>
          <p class="text-sm text-ui-content-muted">Étape {{ step }} sur 3 : {{ step === 1 ? 'Sélection' : (step === 2 ? 'Mapping' : 'Importation') }}</p>
        </div>
        <button @click="closeAndReset"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1">
        
        <!-- ÉTAPE 1 : Upload -->
        <div v-if="step === 1" class="space-y-6 text-center">
          <div 
            class="border-2 border-dashed border-ui-border rounded-xl p-10 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
            @click="fileInput?.click()"
          >
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Icon name="lucide:upload-cloud" class="w-8 h-8" />
            </div>
            <h4 class="text-lg font-bold text-ui-content">Déposez votre fichier CSV ici</h4>
            <p class="text-sm text-ui-content-muted mt-2">ou cliquez pour parcourir vos fichiers</p>
            <input type="file" ref="fileInput" class="hidden" accept=".csv" @change="handleFileSelect" />
          </div>
          <div class="text-xs text-ui-content-muted bg-orange-50 text-orange-800 p-3 rounded-lg border border-orange-100">
            <Icon name="lucide:info" class="w-3 h-3 inline mr-1" />
            Pour le moment, seuls les fichiers CSV sont supportés. Assurez-vous que votre fichier contient au moins une colonne pour la <strong>Date</strong> et le <strong>Montant</strong>.
          </div>
        </div>

        <!-- ÉTAPE 2 : Mapping & Aperçu -->
        <div v-if="step === 2" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Icon name="lucide:file-spreadsheet" class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                  <p class="text-sm font-bold text-blue-900">Fichier : {{ selectedFile?.name }}</p>
                  <p class="text-xs text-blue-700">{{ parsedData.length }} lignes de données détectées</p>
              </div>
            </div>
            <div class="relative z-30">
              <UiSelect v-model="targetAccountId" label="Importer vers le compte" :options="accountOptions" placeholder="Choisir un compte..." />
            </div>
          </div>
          
          <div>
            <h4 class="text-sm font-black text-ui-content uppercase tracking-widest mb-2">Aperçu et correspondance</h4>
            <p class="text-xs text-ui-content-muted mb-4">Vérifiez les données et assignez vos colonnes aux champs de l'application. Les colonnes <span class="font-bold text-red-500">Date</span> et <span class="font-bold text-red-500">Montant</span> sont obligatoires.</p>
            
            <div class="bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-3 text-orange-800 text-xs mb-4">
                <Icon name="lucide:alert-triangle" class="w-4 h-4 shrink-0 mt-0.5" />
                <p><strong>Attention :</strong> Si votre fichier contient une colonne "Solde", veuillez sélectionner <strong>Ignorer</strong>. Le solde est recalculé automatiquement par l'application pour garantir la cohérence.</p>
            </div>
            
            <div class="overflow-x-auto border border-ui-border rounded-lg bg-ui-surface shadow-sm">
              <table class="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th v-for="header in headers" :key="header" class="p-4 text-left bg-ui-surface-muted border-b border-ui-border min-w-[200px] align-top">
                      <div class="mb-2 text-[10px] font-black text-ui-content-muted uppercase tracking-widest truncate" :title="header">
                        {{ header }}
                      </div>
                      <div class="relative z-20">
                        <UiSelect 
                          v-model="mapping[header]" 
                          :options="mappingOptions" 
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-ui-border">
                  <tr v-for="(row, rowIndex) in parsedData.slice(0, 5)" :key="rowIndex" class="hover:bg-ui-surface-muted/30 transition-colors">
                    <td v-for="header in headers" :key="header" class="p-3 text-ui-content border-b border-ui-border whitespace-nowrap max-w-[200px] truncate font-medium">
                      {{ row[header] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="!isMappingValid" class="mt-3 text-xs text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
              <Icon name="lucide:alert-triangle" class="w-4 h-4" />
              Veuillez assigner au moins une colonne pour la 'Date' et le 'Montant'.
            </div>
          </div>
        </div>

        <!-- ÉTAPE 3 : Progression & Résultat -->
        <div v-if="step === 3" class="flex flex-col items-center justify-center h-full py-10 space-y-6 text-center">
            <div v-if="isImporting" class="w-full max-w-md space-y-4">
                <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin" />
                </div>
                <h3 class="text-lg font-bold text-ui-content">Importation en cours...</h3>
                <div class="w-full bg-ui-surface-muted rounded-full h-2 overflow-hidden">
                    <div class="bg-blue-600 h-full transition-all duration-300 ease-out" :style="{ width: `${progress}%` }"></div>
                </div>
                <p class="text-sm text-ui-content-muted font-mono">{{ progress }}%</p>
            </div>

            <div v-else class="space-y-6 animate-in zoom-in-95 duration-300">
                <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Icon name="lucide:check" class="w-10 h-10" />
                </div>
                <div>
                    <h3 class="text-2xl font-black text-ui-content mb-2">Importation terminée !</h3>
                    <p class="text-sm text-ui-content-muted">
                        <span class="font-bold text-emerald-600">{{ importStats.success }}</span> transactions ajoutées.<br>
                        <span v-if="importStats.errors > 0" class="text-red-500">{{ importStats.errors }} erreurs rencontrées.</span>
                        <span v-if="importStats.skipped > 0" class="text-orange-500">{{ importStats.skipped }} lignes ignorées.</span>
                    </p>
                </div>
                <UiButton @click="finish" class="px-8 shadow-lg shadow-emerald-500/20">
                    Terminer
                </UiButton>
            </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div v-if="step < 3" class="p-6 border-t border-ui-border bg-ui-surface-muted/30 flex justify-between rounded-b-2xl">
         <UiButton v-if="step > 1" @click="step--" variant="secondary">Précédent</UiButton>
         <div v-else></div> <!-- Spacer -->

         <UiButton v-if="step === 2" @click="confirmImport" :disabled="!targetAccountId || !isMappingValid || isImporting" :loading="isImporting" class="shadow-lg shadow-blue-500/20">
            Lancer l'importation
         </UiButton>
      </div>
    </div>
  </UiModal>
</template>