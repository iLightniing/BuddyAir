<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { useProjectHistory } from '~/composables/useProjectHistory'
import ProjectCard from '~/components/dashboard/projects/ProjectCard.vue'
import ProjectHistoryModal from '~/components/dashboard/projects/ProjectHistoryModal.vue'

definePageMeta({ title: 'Projets Archivés' })

const pb = usePocketBase()
const { notify } = useNotification()
const user = usePocketBaseUser()

const loading = ref(true)
const projects = ref<any[]>([])

const { showHistoryModal, historyProject, historyTransactions, historyLoading, openHistoryModal } = useProjectHistory()

const fetchData = async () => {
  if (!user.value) return
  loading.value = true
  try {
    const result = await pb.collection('savings_goals').getFullList({
      filter: `user = "${user.value.id}" && is_archived = true`,
      sort: '+order,-updated',
      requestKey: null
    })
    projects.value = result.map(p => ({ ...p }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const restoreProject = async (project: any) => {
  if (!confirm("Voulez-vous restaurer ce projet ?")) return
  try {
    await pb.collection('savings_goals').update(project.id, { is_archived: false })
    notify('Projet restauré', 'success')
    fetchData()
  } catch (e) {
    notify('Erreur lors de la restauration', 'error')
  }
}

const deleteProject = async (project: any) => {
  if (!confirm("Supprimer définitivement ce projet archivé ?")) return
  try {
    await pb.collection('savings_goals').delete(project.id)
    notify('Projet supprimé', 'success')
    fetchData()
  } catch (e) {
    notify('Erreur lors de la suppression', 'error')
  }
}

const updateOrder = async () => {
  const promises = projects.value.map((p, index) => {
     return pb.collection('savings_goals').update(p.id, { order: index })
  })
  try { await Promise.all(promises) } catch(e) {}
}

// Helpers (simplifiés pour l'archive)
const getDeadlineBadge = (dateStr: string) => {
    if (!dateStr) return null
    const target = new Date(dateStr)
    return { label: target.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), class: 'bg-gray-100 text-gray-600 border-gray-200' }
}
const getMonthlyEffort = () => null

onMounted(fetchData)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard/projects" class="p-2 hover:bg-ui-surface-muted rounded-md text-ui-content-muted hover:text-ui-content transition-colors">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <h1 class="text-2xl font-black text-ui-content tracking-tight">Archives</h1>
    </div>

    <div v-if="loading" class="py-20 flex justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <VueDraggable 
      v-else-if="projects.length > 0"
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
        @restore="restoreProject"
        @delete="deleteProject"
      />
    </VueDraggable>

    <div v-else class="text-center py-12 bg-ui-surface border border-ui-border rounded-3xl border-dashed">
        <p class="text-ui-content-muted text-sm">Aucun projet archivé.</p>
    </div>

    <ProjectHistoryModal 
      :show="showHistoryModal"
      :project="historyProject"
      :loading="historyLoading"
      :transactions="historyTransactions"
      @close="showHistoryModal = false"
    />
  </div>
</template>