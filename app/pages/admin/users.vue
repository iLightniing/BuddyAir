<script setup lang="ts">
import { useUsersManager } from '~/composables/useUsersManager'
import AdminUsersViewModal from '~/components/admin/users/ViewModal.vue'
import AdminUsersEditModal from '~/components/admin/users/EditModal.vue'
import AdminUsersDeleteModal from '~/components/admin/users/DeleteModal.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Gestion des utilisateurs',
  middleware: ['admin']
})

const {
  loading, users, showViewModal, showEditModal, showDeleteModal, selectedUser, roles,
  fetchUsers, getRoleLabel, handleView, handleEdit, handleDelete, confirmDelete, impersonate
} = useUsersManager()

onMounted(fetchUsers)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UiBackButton to="/admin" />
        <h1 class="text-2xl font-black text-ui-content tracking-tight">Utilisateurs</h1>
      </div>
      <div class="text-sm text-ui-content-muted font-bold">
        {{ users.length }} inscrit(s)
      </div>
    </div>

    <!-- Tableau -->
    <div class="bg-ui-surface border border-ui-border rounded-xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 flex justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
      </div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead class="bg-ui-surface-muted/50 border-b border-ui-border text-[10px] font-black text-ui-content-muted uppercase tracking-widest">
          <tr>
            <th class="p-4">Utilisateur</th>
            <th class="p-4">Email</th>
            <th class="p-4">Rôle</th>
            <th class="p-4">Inscrit le</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ui-border">
          <tr v-for="user in users" :key="user.id" class="group hover:bg-ui-surface-muted/30 transition-colors">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                  <img v-if="user.avatar" :src="`http://127.0.0.1:8090/api/files/users/${user.id}/${user.avatar}`" class="w-full h-full object-cover" alt="Avatar" />
                  <span v-else>{{ user.name?.charAt(0).toUpperCase() || 'U' }}</span>
                </div>
                <span class="font-bold text-ui-content text-sm">{{ user.name || 'Sans nom' }}</span>
              </div>
            </td>
            <td class="p-4 text-sm text-ui-content-muted">{{ user.email }}</td>
            <td class="p-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" :class="getRoleLabel(user.role).class">
                {{ getRoleLabel(user.role).label }}
              </span>
            </td>
            <td class="p-4 text-sm text-ui-content-muted tabular-nums">
              {{ new Date(user.created).toLocaleDateString('fr-FR') }}
            </td>
            <td class="p-4 text-right">
              <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="handleView(user)" class="p-2 hover:bg-blue-50 text-blue-600 rounded-md transition-colors" title="Voir les détails">
                  <Icon name="lucide:eye" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal : Voir -->
    <AdminUsersViewModal 
      :show="showViewModal" 
      :user="selectedUser" 
      @close="showViewModal = false"
      @edit="handleEdit"
      @delete="handleDelete"
      @impersonate="impersonate"
    />

    <!-- Modal : Modifier Rôle -->
    <AdminUsersEditModal
      :show="showEditModal"
      :user="selectedUser"
      :roles="roles"
      @close="showEditModal = false"
      @saved="() => { showEditModal = false; fetchUsers() }"
    />

    <!-- Modal : Supprimer -->
    <AdminUsersDeleteModal
      :show="showDeleteModal"
      :user="selectedUser"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>