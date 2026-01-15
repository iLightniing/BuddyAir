<script setup lang="ts">
import { useAnnouncementManager } from '~/composables/useAnnouncementManager'

definePageMeta({
  layout: 'dashboard',
  title: 'Gestion des Annonces',
  middleware: ['admin']
})

const {
  announcements, loading, newMessage, showEditModal, showDeleteModal, editForm,
  createAnnouncement, openEditModal, handleUpdate, requestDelete, confirmDelete, toggleActive, init
} = useAnnouncementManager()

onMounted(init)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UiBackButton to="/admin" />
      <div>
          <h1 class="text-2xl font-black text-ui-content tracking-tight">Annonces & Alertes</h1>
          <p class="text-sm text-ui-content-muted">Gérez les bandeaux d'information affichés aux utilisateurs.</p>
      </div>
    </div>

    <!-- Toolbar Création Rapide -->
    <div class="bg-ui-surface border border-ui-border rounded-xl p-4 flex gap-4 items-center shadow-sm">
      <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Icon name="lucide:megaphone" class="w-5 h-5" />
      </div>
      <input 
        v-model="newMessage" 
        @keydown.enter="createAnnouncement"
        type="text" 
        placeholder="Écrivez votre annonce ici (ex: Maintenance ce soir à 22h)..." 
        class="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-ui-content-muted/50 h-full"
      />
      <UiButton @click="createAnnouncement" :disabled="!newMessage.trim()" class="shrink-0">
        Publier
      </UiButton>
    </div>

    <!-- Tableau -->
    <div class="bg-ui-surface border border-ui-border rounded-xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 flex justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
      </div>
      
      <div v-else-if="announcements.length === 0" class="p-12 text-center text-ui-content-muted">
        Aucune annonce dans l'historique.
      </div>

      <table v-else class="w-full text-left text-sm">
        <thead class="bg-ui-surface-muted border-b border-ui-border text-xs uppercase text-ui-content-muted font-bold">
          <tr>
            <th class="px-6 py-4 w-48">Date</th>
            <th class="px-6 py-4">Message</th>
            <th class="px-6 py-4 w-32 text-center">Actif</th>
            <th class="px-6 py-4 w-32 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ui-border">
          <tr v-for="item in announcements" :key="item.id" class="hover:bg-ui-surface-muted/30 transition-colors group">
            <td class="px-6 py-4 text-ui-content-muted font-mono text-xs">
              {{ new Date(item.created).toLocaleDateString('fr-FR') }}
              <span class="opacity-50 ml-1">{{ new Date(item.created).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) }}</span>
            </td>
            <td class="px-6 py-4 font-medium text-ui-content">
              {{ item.message }}
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" :checked="item.is_active" @change="toggleActive(item)" class="sr-only peer">
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEditModal(item)" class="p-1.5 hover:bg-blue-50 text-ui-content-muted hover:text-blue-600 rounded-md transition-colors" title="Modifier">
                  <Icon name="lucide:pen-line" class="w-4 h-4" />
                </button>
                <button @click="requestDelete(item)" class="p-1.5 hover:bg-red-50 text-ui-content-muted hover:text-red-600 rounded-md transition-colors" title="Supprimer">
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Édition (Simplifiée) -->
    <UiModal :show="showEditModal" @close="showEditModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-lg font-black text-ui-content mb-4">Modifier l'annonce</h3>
        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-ui-content mb-1 block">Message</label>
            <textarea v-model="editForm.message" rows="3" class="w-full bg-ui-surface border border-ui-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors" required></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <UiButton type="button" @click="showEditModal = false" variant="secondary">Annuler</UiButton>
            <UiButton type="submit">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:triangle-alert" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer l'annonce ?</h3>
        <p class="text-sm text-ui-content-muted mb-6">Cette action est irréversible.</p>
        <div class="flex justify-center gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>