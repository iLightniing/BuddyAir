<script setup lang="ts">
import { useLogsManager } from '~/composables/useLogsManager'
import LogItem from '~/components/admin/LogItem.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Logs Système',
  middleware: ['admin']
})

const {
  logs, loading, selectedLevel, searchQuery, page, totalPages, isLive, levels,
  fetchLogs, handleSearch, changePage, downloadCsv, createTestLog, clearAllLogs
} = useLogsManager()

const showClearModal = ref(false)

const requestClearLogs = () => {
  showClearModal.value = true
}

const confirmClearLogs = async () => {
  await clearAllLogs()
  showClearModal.value = false
}

onMounted(fetchLogs)
</script>

<template>
  <div>
  <div class="space-y-6 flex flex-col">
    <!-- Header & Toolbar -->
    <div class="flex flex-col gap-4 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UiBackButton to="/admin" />
          <div>
              <h1 class="text-2xl font-black text-ui-content tracking-tight">Console Système</h1>
              <p class="text-sm text-ui-content-muted">Surveillance et diagnostic de l'application.</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Mode Live -->
          <button 
            @click="isLive = !isLive"
            class="w-9 h-9 flex items-center justify-center rounded-md transition-colors border shadow-sm"
            :class="isLive ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-ui-surface text-ui-content-muted border-ui-border hover:bg-ui-surface-muted hover:text-ui-content'"
            :title="isLive ? 'Désactiver le mode Live' : 'Activer le mode Live'"
          >
            <Icon :name="isLive ? 'lucide:activity' : 'lucide:play'" class="w-4 h-4" :class="{'animate-pulse': isLive}" />
          </button>

          <div class="w-px h-6 bg-ui-border mx-1"></div>

          <button @click="downloadCsv" class="w-9 h-9 flex items-center justify-center rounded-md transition-colors border shadow-sm bg-ui-surface text-ui-content-muted border-ui-border hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" title="Exporter en CSV">
              <Icon name="lucide:download" class="w-4 h-4" />
          </button>
          <button @click="createTestLog" class="w-9 h-9 flex items-center justify-center rounded-md transition-colors border shadow-sm bg-ui-surface text-ui-content-muted border-ui-border hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200" title="Générer un log de test">
              <Icon name="lucide:bug" class="w-4 h-4" />
          </button>
          <button @click="requestClearLogs" class="w-9 h-9 flex items-center justify-center rounded-md transition-colors border shadow-sm bg-ui-surface text-ui-content-muted border-ui-border hover:bg-red-50 hover:text-red-600 hover:border-red-200" title="Tout effacer">
              <Icon name="lucide:trash-2" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="flex gap-3 bg-ui-surface border border-ui-border p-2 rounded-xl shadow-sm">
        <div class="relative flex-1">
          <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-content-muted" />
          <input 
            v-model="searchQuery"
            @input="handleSearch"
            type="text" 
            placeholder="Rechercher dans les messages..." 
            class="w-full bg-transparent pl-9 pr-4 py-2 text-sm outline-none placeholder:text-ui-content-muted/70 text-ui-content"
          />
        </div>
        <div class="w-px bg-ui-border my-1"></div>
        <div class="w-48">
            <UiSelect v-model="selectedLevel" :options="levels" class="!border-0 !shadow-none !bg-transparent" />
        </div>
      </div>
    </div>

    <!-- Liste des logs (Scrollable) -->
    <div class="bg-ui-surface border border-ui-border rounded-xl shadow-sm overflow-hidden flex flex-col text-ui-content font-mono text-xs">
      <div class="overflow-y-auto max-h-[600px] p-0 scrollbar-thin">
        <div v-if="loading" class="p-12 flex justify-center">
          <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        
        <div v-else-if="logs.length === 0" class="h-full flex flex-col items-center justify-center text-ui-content-muted p-8">
          <div class="w-16 h-16 bg-ui-surface-muted rounded-full flex items-center justify-center mb-4">
            <Icon name="lucide:check-circle" class="w-8 h-8 text-emerald-500" />
          </div>
          <p class="font-medium">Aucun log trouvé</p>
          <p class="text-xs mt-1">Tout semble fonctionner correctement.</p>
        </div>

        <div v-else class="divide-y divide-ui-border">
          <LogItem 
            v-for="log in logs" 
            :key="log.id" 
            :log="log" 
          />
        </div>
      </div>

      <!-- Footer Pagination -->
      <div class="p-3 border-t border-ui-border bg-ui-surface-muted/30 flex items-center justify-between text-xs shrink-0">
        <span class="text-ui-content-muted">Page {{ page }} sur {{ totalPages }}</span>
        <div class="flex gap-2">
          <button 
            @click="changePage(page - 1)" 
            :disabled="page <= 1"
            class="px-3 py-1.5 rounded hover:bg-ui-surface border border-transparent hover:border-ui-border disabled:opacity-30 disabled:cursor-not-allowed transition-all text-ui-content-muted hover:text-ui-content"
          >
            Précédent
          </button>
          <button 
            @click="changePage(page + 1)" 
            :disabled="page >= totalPages"
            class="px-3 py-1.5 rounded hover:bg-ui-surface border border-transparent hover:border-ui-border disabled:opacity-30 disabled:cursor-not-allowed transition-all text-ui-content-muted hover:text-ui-content"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>

    <!-- Modal Suppression Logs -->
    <UiModal :show="showClearModal" @close="showClearModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-md w-full text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:trash-2" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Vider les logs ?</h3>
        <p class="text-sm text-ui-content-muted mb-6">
          Cette action est irréversible. Tout l'historique des erreurs et activités sera effacé.
        </p>
        <div class="flex gap-3">
          <UiButton @click="showClearModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmClearLogs" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700">Tout effacer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<style scoped>
/* Scrollbar fine pour la liste des logs */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: var(--ui-border);
  border-radius: 20px;
}
</style>