<script setup lang="ts">
import { useAccounts } from '~/composables/useAccounts' // Pour récupérer la liste des comptes

const { allAccounts } = useAccounts() // On a besoin des comptes pour l'import
const showImportModal = ref(false)
const showAdvancedExportModal = ref(false)

const { notify } = useNotification()
const handleImportSuccess = () => {
  notify('Importation réussie ! Vos transactions ont été ajoutées.', 'success')
  // On pourrait ici forcer un re-fetch global si nécessaire
}
</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Export Card -->
        <div class="bg-ui-surface border border-ui-border rounded-xl p-6 shadow-sm flex flex-col gap-8 h-full">
            <div>
                <h2 class="text-xl font-black text-ui-content mb-1">Exportation</h2>
                <p class="text-sm text-ui-content-muted">Récupérez vos données sous différents formats.</p>
            </div>

            <div class="flex-1 flex flex-col items-center justify-center text-center gap-6 py-8">
                <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                    <Icon name="lucide:download-cloud" class="w-10 h-10" />
                </div>
                
                <div class="max-w-xs mx-auto">
                    <h3 class="text-lg font-bold text-ui-content mb-2">Exporter vos données</h3>
                    <p class="text-sm text-ui-content-muted">
                        Téléchargez vos transactions, comptes ou une sauvegarde complète via notre assistant.
                    </p>
                </div>

                <button @click="showAdvancedExportModal = true" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                    Lancer l'assistant d'exportation
                    <Icon name="lucide:arrow-right" class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Import Card -->
        <div class="bg-ui-surface border border-ui-border rounded-xl p-6 shadow-sm flex flex-col h-full">
            <div>
                <h2 class="text-xl font-black text-ui-content mb-1">Importation</h2>
                <p class="text-sm text-ui-content-muted">Restaurez une sauvegarde ou importez des données bancaires.</p>
            </div>

            <div class="border-2 border-dashed border-ui-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-ui-surface-muted/30 transition-colors cursor-pointer group flex-1 min-h-[300px] mt-6" @click="showImportModal = true">
                <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon name="lucide:upload-cloud" class="w-8 h-8" />
                </div>
                <h3 class="text-lg font-bold text-ui-content">Importer un fichier</h3>
                <p class="text-sm text-ui-content-muted mt-1 max-w-md">
                    Cliquez pour lancer l'assistant.<br>
                    <span class="text-xs opacity-70">Formats : CSV, JSON</span>
                </p>
            </div>
        </div>
    </div>

    <SettingsImportWizardModal 
      :show="showImportModal" 
      :accounts="allAccounts" 
      @close="showImportModal = false"
      @success="handleImportSuccess"
    />

    <SettingsAdvancedExportModal
      :show="showAdvancedExportModal"
      :accounts="allAccounts"
      @close="showAdvancedExportModal = false"
    />
  </div>
</template>