<script setup lang="ts">
/**
 * Collection PocketBase 'savings_goals' requise :
 * - user : Relation
 * - name : Text
 * - target_amount : Number
 * - saved_amount : Number
 * - deadline : Date (Nouveau)
 * - color : Text (Nouveau - ex: 'bg-blue-500')
 * - icon : Text (Nouveau - ex: 'lucide:plane')
 */
definePageMeta({ title: 'Mes Projets' })

import { VueDraggable } from 'vue-draggable-plus'
import { useProjectsManager } from '~/composables/useProjectsManager'
import ProjectCard from '~/components/dashboard/projects/ProjectCard.vue'
import ProjectFormModal from '~/components/dashboard/projects/ProjectFormModal.vue'
import ProjectDepositModal from '~/components/dashboard/projects/ProjectDepositModal.vue'
import ProjectHistoryModal from '~/components/dashboard/projects/ProjectHistoryModal.vue'
import ProjectDeleteModal from '~/components/dashboard/projects/ProjectDeleteModal.vue'
import ProjectArchiveModal from '~/components/dashboard/projects/ProjectArchiveModal.vue'

const {
  loading, projects, accounts,
  showModal, editingProject, showDeleteModal, projectToDelete,
  showDepositModal, depositProject, depositAmount, depositAccount, transferType,
  showHistoryModal, historyProject, historyTransactions, historyLoading,
  form, colors, icons, stats, accountOptions,
  fetchData, updateOrder, openModal, saveProject, deleteProject, confirmDelete,
  openTransferModal, confirmDeposit, openHistoryModal, archiveProject,
  showArchiveModal, projectToArchive, confirmArchive,
  getMonthlyEffort, getDeadlineBadge
} = useProjectsManager()

onMounted(fetchData)
</script>

<template>
  <div class="space-y-8">
    <!-- Header Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Synthèse (Hero) -->
      <div class="bg-ui-surface border border-ui-border rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden h-40">
         <div class="relative z-10">
            <span class="text-sm font-bold text-ui-content-muted uppercase tracking-wider mb-1 block">Épargne Totale</span>
            <div class="flex items-baseline gap-2">
               <span class="text-3xl font-black text-ui-content tracking-tight">{{ stats.totalSaved.toLocaleString('fr-FR') }} €</span>
            </div>
            <div class="mt-2" v-if="stats.progress > 0">
               <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                 {{ stats.progress.toFixed(0) }}% de l'objectif
               </span>
            </div>
         </div>
         <div class="absolute right-0 top-0 p-4 opacity-5">
            <Icon name="lucide:rocket" class="w-32 h-32 text-ui-content" />
         </div>
      </div>

      <!-- Nouveau Projet -->
      <button @click="openModal()" class="bg-ui-surface border-2 border-dashed border-ui-border hover:border-blue-500 hover:bg-blue-50/50 text-ui-content-muted hover:text-blue-600 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all group h-40">
         <div class="w-12 h-12 rounded-full bg-ui-surface-muted group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <Icon name="lucide:plus" class="w-6 h-6" />
         </div>
         <span class="font-bold text-sm">Nouveau Projet</span>
      </button>

      <!-- Archives -->
      <button @click="navigateTo('/dashboard/projects/archives')" class="bg-ui-surface border border-ui-border hover:border-purple-500 hover:bg-purple-50/50 text-ui-content-muted hover:text-purple-600 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all group h-40">
         <div class="w-12 h-12 rounded-full bg-ui-surface-muted group-hover:bg-purple-100 flex items-center justify-center transition-colors">
            <Icon name="lucide:archive" class="w-6 h-6" />
         </div>
         <span class="font-bold text-sm">Projets Archivés</span>
      </button>
    </div>

    <!-- Liste des projets -->
    <div v-if="loading" class="py-20 flex justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <VueDraggable 
      v-else
      v-model="projects"
      :animation="300"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      @end="updateOrder"
    >
      <ProjectCard 
        v-for="project in projects" 
        :key="project.id" 
        :project="project"
        :get-deadline-badge="getDeadlineBadge"
        :get-monthly-effort="getMonthlyEffort"
        @history="openHistoryModal"
        @edit="openModal"
        @delete="deleteProject"
        @transfer="openTransferModal"
        @archive="archiveProject"
      />
    </VueDraggable>

    <ProjectFormModal :show="showModal" :editing-project="editingProject" :form="form" :colors="colors" :icons="icons" @close="showModal = false" @save="saveProject" />
    <ProjectDepositModal :show="showDepositModal" :project="depositProject" :account-options="accountOptions" v-model:amount="depositAmount" v-model:account="depositAccount" v-model:type="transferType" @close="showDepositModal = false" @confirm="confirmDeposit" />
    <ProjectHistoryModal :show="showHistoryModal" :project="historyProject" :loading="historyLoading" :transactions="historyTransactions" @close="showHistoryModal = false" />
    <ProjectDeleteModal :show="showDeleteModal" :project="projectToDelete" @close="showDeleteModal = false" @confirm="confirmDelete" />
    <ProjectArchiveModal :show="showArchiveModal" :project="projectToArchive" @close="showArchiveModal = false" @confirm="confirmArchive" />
  </div>
</template>
