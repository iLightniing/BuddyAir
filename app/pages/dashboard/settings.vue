<script setup lang="ts">
definePageMeta({
  title: 'Paramètres'
})

const activeTab = ref('categories')

const tabs = [
  { id: 'categories', label: 'Catégories', icon: 'lucide:tag' },
  { id: 'payments', label: 'Paiements', icon: 'lucide:credit-card' },
  { id: 'rules', label: 'Règles', icon: 'lucide:wand-2' },
  { id: 'tags', label: 'Tags', icon: 'lucide:bookmark' },
  { id: 'data', label: 'Import & Export', icon: 'lucide:database' },
  { id: 'about', label: 'À propos', icon: 'lucide:info' }
]
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

    <!-- Content Area -->
    <div>
        <Transition name="fade" mode="out-in">
          <div v-if="activeTab === 'categories'" class="space-y-6">
             <SettingsCategories />
          </div>

          <div v-else-if="activeTab === 'payments'" class="space-y-6">
             <SettingsPaymentMethods />
          </div>

          <div v-else-if="activeTab === 'rules'" class="space-y-6">
             <SettingsRules />
          </div>

          <div v-else-if="activeTab === 'tags'" class="space-y-6">
             <SettingsTags />
          </div>

          <div v-else-if="activeTab === 'data'" class="space-y-6">
             <SettingsDataExport />
          </div>

          <div v-else-if="activeTab === 'about'" class="space-y-6">
             <SettingsAbout />
          </div>
        </Transition>
    </div>
  </div>
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