<script setup lang="ts">
/**
 * Collection PocketBase 'categories' requise :
 * - user : Relation
 * - name : Text
 * - color : Text
 * - icon : Text
 * - sub_categories : JSON (Tableau de chaînes)
 */
definePageMeta({ title: 'Paramètres' })

const pb = usePocketBase()
const { notify } = useNotification()
const user = usePocketBaseUser()

const activeTab = ref('categories')
const tabs = [
  { id: 'categories', label: 'Catégories', icon: 'lucide:tag' },
  { id: 'data', label: 'Données & Export', icon: 'lucide:database' },
  { id: 'app', label: 'Application', icon: 'lucide:smartphone' }
]

// --- Export ---
const exportLoading = ref(false)

const exportData = async (format: 'csv' | 'json') => {
  if (!user.value) return
  exportLoading.value = true
  try {
    const transactions = await pb.collection('transactions').getFullList({
      filter: `user = "${user.value.id}"`,
      sort: '-date',
      expand: 'account'
    })

    let content = ''
    let mimeType = ''
    let extension = ''

    if (format === 'json') {
      content = JSON.stringify(transactions, null, 2)
      mimeType = 'application/json'
      extension = 'json'
    } else {
      // CSV Header
      const headers = ['Date', 'Description', 'Montant', 'Type', 'Catégorie', 'Compte', 'Statut']
      const rows = transactions.map(tx => [
        new Date(tx.date).toLocaleDateString('fr-FR'),
        `"${(tx.description || '').replace(/"/g, '""')}"`, // Escape quotes
        tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
        tx.type,
        `"${tx.category || ''}"`,
        `"${tx.expand?.account?.name || ''}"`,
        tx.status
      ])
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      mimeType = 'text/csv;charset=utf-8;'
      extension = 'csv'
    }

    // Trigger download
    const blob = new Blob([content], { type: mimeType })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `buddyair_export_${new Date().toISOString().split('T')[0]}.${extension}`
    link.click()
    URL.revokeObjectURL(link.href)
    
    notify('Export terminé avec succès', 'success')
  } catch (e) {
    notify('Erreur lors de l\'export', 'error')
  } finally {
    exportLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Tabs -->
    <div class="flex p-1 bg-ui-surface border border-ui-border rounded-xl w-full md:w-fit">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none justify-center"
        :class="activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-ui-content-muted hover:text-ui-content hover:bg-ui-surface-muted'"
      >
        <Icon :name="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Contenu : Catégories -->
    <div v-if="activeTab === 'categories'">
      <SettingsCategories />
    </div>

    <!-- Contenu : Données -->
    <div v-if="activeTab === 'data'" class="space-y-6">
      <div class="bg-ui-surface border border-ui-border rounded-2xl p-8">
        <h2 class="text-xl font-black text-ui-content mb-2">Exportation des données</h2>
        <p class="text-sm text-ui-content-muted mb-8">Téléchargez l'intégralité de vos transactions pour les analyser dans un tableur ou les archiver.</p>
        
        <div class="flex flex-col sm:flex-row gap-4">
          <button @click="exportData('csv')" :disabled="exportLoading" class="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold hover:bg-emerald-100 transition-colors">
            <Icon name="lucide:file-spreadsheet" class="w-6 h-6" />
            Exporter en CSV (Excel)
          </button>
          <button @click="exportData('json')" :disabled="exportLoading" class="flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors">
            <Icon name="lucide:file-json" class="w-6 h-6" />
            Exporter en JSON (Brut)
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu : Application (Placeholder) -->
    <div v-if="activeTab === 'app'" class="text-center py-12 text-ui-content-muted">
      <Icon name="lucide:construction" class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Paramètres de l'application à venir (Thème, Notifications...)</p>
    </div>
  </div>
</template>