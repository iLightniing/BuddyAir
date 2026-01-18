<script setup lang="ts">
import { useUsersManager } from '~/composables/useUsersManager'

definePageMeta({
  layout: 'dashboard',
  title: 'Gestion des utilisateurs',
  middleware: ['admin']
})

const {
  loading, users, showViewModal, showEditModal, showDeleteModal, selectedUser, editForm, roles,
  fetchUsers, getRoleLabel, handleView, handleEdit, handleDelete, saveRole, confirmDelete, impersonate
} = useUsersManager()

onMounted(fetchUsers)

const cancelEditRole = () => {
  showEditModal.value = false
  showViewModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  showViewModal.value = true
}
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
    <UiModal :show="showViewModal">
      <div class="bg-ui-surface border border-ui-border rounded-xl shadow-2xl max-w-2xl w-full">
        <!-- Header -->
        <div class="bg-ui-surface-muted p-6 border-b border-ui-border flex items-start justify-between rounded-t-xl">
           <div class="flex items-center gap-5">
              <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black shadow-sm border-2 border-white overflow-hidden">
                 <img v-if="selectedUser?.avatar" :src="`http://127.0.0.1:8090/api/files/users/${selectedUser.id}/${selectedUser.avatar}`" class="w-full h-full object-cover" alt="Avatar" />
                 <span v-else>{{ selectedUser?.name?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
              <div>
                 <h3 class="text-xl font-black text-ui-content">{{ selectedUser?.name || 'Utilisateur' }}</h3>
                 <p class="text-sm text-ui-content-muted font-medium">{{ selectedUser?.email }}</p>
                 <div class="mt-2 flex gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border" :class="selectedUser ? getRoleLabel(selectedUser.role).class.replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-') : ''">
                       {{ selectedUser ? getRoleLabel(selectedUser.role).label : '' }}
                    </span>
                    <span v-if="selectedUser?.verified" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                       <Icon name="lucide:badge-check" class="w-3 h-3 mr-1" /> Vérifié
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                       Non vérifié
                    </span>
                 </div>
              </div>
           </div>
        </div>

        <div v-if="selectedUser" class="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
           <!-- Informations Personnelles -->
           <div>
              <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-ui-border">
                 <Icon name="lucide:user" class="w-4 h-4" /> Informations personnelles
              </h4>
              <div class="grid grid-cols-2 gap-y-6 gap-x-8">
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Prénom & Nom</p>
                    <p class="text-sm font-medium text-ui-content">{{ selectedUser.firstname || '-' }} {{ selectedUser.surname || '' }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Téléphone</p>
                    <p class="text-sm font-medium text-ui-content">{{ selectedUser.phone || '-' }}</p>
                 </div>
                 <div class="col-span-2">
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Adresse</p>
                    <p class="text-sm font-medium text-ui-content">
                       <span v-if="!selectedUser.address && !selectedUser.city">-</span>
                       <template v-else>
                         {{ selectedUser.address }}<br>
                         {{ selectedUser.zipcode }} {{ selectedUser.city }} <span v-if="selectedUser.country">({{ selectedUser.country }})</span>
                       </template>
                    </p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Date de naissance</p>
                    <p class="text-sm font-medium text-ui-content">{{ selectedUser.birthdate ? new Date(selectedUser.birthdate).toLocaleDateString('fr-FR') : '-' }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Sexe</p>
                    <p class="text-sm font-medium text-ui-content">{{ selectedUser.sex || '-' }}</p>
                 </div>
              </div>
           </div>

           <!-- Métadonnées -->
           <div>
              <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-ui-border">
                 <Icon name="lucide:database" class="w-4 h-4" /> Métadonnées
              </h4>
              <div class="grid grid-cols-2 gap-4 bg-ui-surface-muted/50 p-4 rounded-lg border border-ui-border">
                 <div class="col-span-2">
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">ID Utilisateur</p>
                    <p class="text-xs font-mono text-ui-content select-all bg-white border border-ui-border rounded px-2 py-1 inline-block">{{ selectedUser.id }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Créé le</p>
                    <p class="text-xs font-medium text-ui-content">{{ new Date(selectedUser.created).toLocaleString('fr-FR') }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Dernière mise à jour</p>
                    <p class="text-xs font-medium text-ui-content">{{ new Date(selectedUser.updated).toLocaleString('fr-FR') }}</p>
                 </div>
              </div>
           </div>
        </div>
        
        <div class="bg-ui-surface-muted p-4 border-t border-ui-border flex justify-between items-center rounded-b-xl">
           <div class="relative group flex items-center">
               <UiButton @click="handleDelete(selectedUser)" variant="ghost" class="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700">
                 <Icon name="lucide:trash-2" class="w-5 h-5" />
               </UiButton>
               <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl transform translate-y-1 group-hover:translate-y-0 bg-red-900 text-white">
                   Supprimer l'utilisateur
                   <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-900"></div>
               </div>
           </div>
           <div class="flex items-center gap-3">
             <div class="relative group flex items-center">
                <UiButton 
                    @click="impersonate(selectedUser)" 
                    :disabled="!selectedUser.support_mode"
                    class="h-9 w-9 p-0 !bg-indigo-600 text-white hover:!bg-indigo-700 shadow-indigo-500/20 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                    <Icon :name="selectedUser.support_mode ? 'lucide:venetian-mask' : 'lucide:lock'" class="w-5 h-5" />
                </UiButton>
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl transform translate-y-1 group-hover:translate-y-0"
                     :class="selectedUser.support_mode ? 'bg-indigo-900 text-white' : 'bg-red-600 text-white'">
                    {{ selectedUser.support_mode ? `Se connecter en tant que ${selectedUser.name || 'cet utilisateur'}` : 'Mode Support désactivé par l\'utilisateur' }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" :class="selectedUser.support_mode ? 'border-t-indigo-900' : 'border-t-red-600'"></div>
                </div>
             </div>
             <div class="relative group flex items-center">
                 <UiButton @click="handleEdit(selectedUser)" class="h-9 w-9 p-0 !bg-red-600 text-white hover:!bg-red-700 shadow-red-500/20 shadow-lg"><Icon name="lucide:shield" class="w-5 h-5" /></UiButton>
                 <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl transform translate-y-1 group-hover:translate-y-0 bg-red-900 text-white">
                     Modifier le rôle
                     <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-900"></div>
                 </div>
             </div>
             <div class="relative group flex items-center">
                 <UiButton @click="showViewModal = false" class="h-9 w-9 p-0 bg-slate-800 text-white hover:bg-slate-900 border-slate-900 shadow-lg shadow-slate-900/20">
                    <Icon name="lucide:x" class="w-5 h-5" />
                 </UiButton>
                 <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl transform translate-y-1 group-hover:translate-y-0 bg-slate-900 text-white">
                     Fermer
                     <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                 </div>
             </div>
           </div>
        </div>
      </div>
    </UiModal>

    <!-- Modal : Modifier Rôle -->
    <UiModal :show="showEditModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3 class="text-xl font-black text-ui-content mb-6">Modifier le rôle</h3>
        <form @submit.prevent="saveRole" class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-ui-content-muted uppercase">Rôle attribué</label>
            <div class="space-y-2">
              <label v-for="role in roles" :key="role.value" class="flex items-center gap-3 p-3 border border-ui-border rounded-lg cursor-pointer hover:bg-ui-surface-muted transition-colors">
                <input type="radio" v-model="editForm.role" :value="role.value" class="w-4 h-4 text-blue-600" />
                <span class="text-sm font-bold" :class="role.value === editForm.role ? 'text-ui-content' : 'text-ui-content-muted'">{{ role.label }}</span>
              </label>
            </div>
          </div>
          <div class="flex gap-3">
            <UiButton type="button" @click="cancelEditRole" variant="secondary" class="flex-1">Annuler</UiButton>
            <UiButton type="submit" class="flex-1">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal : Supprimer -->
    <UiModal :show="showDeleteModal">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-black text-ui-content tracking-tight">Supprimer le compte ?</h3>
        </div>
        <p class="text-sm text-ui-content-muted mb-6">
          Êtes-vous sûr de vouloir supprimer l'utilisateur <span class="font-bold text-ui-content">{{ selectedUser?.name }}</span> ?
          <br><br>
          <span class="text-red-500 font-bold">Attention :</span> Cette action supprimera définitivement le compte et toutes les données associées (comptes, transactions, etc.) si la base de données est configurée en cascade.
        </p>
        <div class="flex gap-3">
          <UiButton @click="cancelDelete" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-xl shadow-red-500/20">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>