<script setup lang="ts">
import { useSystemSettings } from '~/composables/useSystemSettings'

definePageMeta({
  layout: 'dashboard',
  title: 'Configuration Système',
  middleware: ['admin']
})

const { settings, loading, fetchSettings, updateSettings } = useSystemSettings()

onMounted(fetchSettings)

const save = async () => {
  await updateSettings(settings.value)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UiBackButton to="/admin" />
      <div>
          <h1 class="text-2xl font-black text-ui-content tracking-tight">Configuration Système</h1>
          <p class="text-sm text-ui-content-muted">Paramètres globaux de l'application.</p>
      </div>
    </div>

    <div v-if="loading && !settings.id" class="p-12 flex justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <div v-else class="grid gap-6 max-w-2xl">
      <!-- Maintenance -->
      <div class="bg-ui-surface border border-ui-border rounded-xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Icon name="lucide:construction" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-ui-content">Mode Maintenance</h3>
              <p class="text-sm text-ui-content-muted">Verrouille l'accès à l'application pour les utilisateurs non-admin.</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.maintenance_mode" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        <div v-if="settings.maintenance_mode" class="pt-4 border-t border-ui-border animate-in slide-in-from-top-2">
          <label class="text-sm font-medium text-ui-content mb-1 block">Message de maintenance</label>
          <textarea v-model="settings.maintenance_message" rows="3" class="w-full bg-ui-surface-muted border border-ui-border rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors"></textarea>
        </div>
      </div>

      <!-- Inscriptions -->
      <div class="bg-ui-surface border border-ui-border rounded-xl p-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Icon name="lucide:user-plus" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-ui-content">Inscriptions</h3>
              <p class="text-sm text-ui-content-muted">Autoriser les nouveaux utilisateurs à créer un compte.</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.allow_registrations" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
      </div>

      <div class="flex justify-end">
        <UiButton @click="save" :loading="loading" class="px-8">Enregistrer les modifications</UiButton>
      </div>
    </div>
  </div>
</template>