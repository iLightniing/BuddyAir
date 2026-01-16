<script setup lang="ts">
import { useUsersManager } from '~/composables/useUsersManager'
import TicketList from '~/components/dashboard/support/TicketList.vue'
import ChatWindow from '~/components/dashboard/support/ChatWindow.vue'
import EmptyState from '~/components/dashboard/support/EmptyState.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Support Admin',
  middleware: ['admin']
})

const { 
  tickets, activeTicket, messages, loading, loadingMessages,
  fetchTickets, selectTicket, sendMessage, updateStatus 
} = useSupport(true)

const user = usePocketBaseUser()
const view = ref<'list' | 'chat'>('list')

// User Modal Logic
const { getRoleLabel } = useUsersManager()
const showUserModal = ref(false)

// Actions déléguées aux composants
const handleSendMessage = async (content: string, files: File[]) => {
  if (!activeTicket.value) return
  await sendMessage(activeTicket.value.id, content, files)
}

const changeStatus = async (status: string | number | undefined) => {
    if (activeTicket.value && typeof status === 'string') {
        await updateStatus(activeTicket.value.id, status)
    }
}

// Responsive
watch(activeTicket, (val) => {
  if (val) view.value = 'chat'
})

onMounted(fetchTickets)
</script>

<template>
  <div class="h-[calc(100vh-140px)] flex overflow-hidden bg-ui-surface border border-ui-border rounded-2xl shadow-sm">
    
    <!-- Colonne Gauche -->
    <div 
      class="w-full md:w-80 lg:w-96 flex flex-col border-r border-ui-border shrink-0 transition-all duration-300 bg-ui-surface-muted/30"
      :class="view === 'list' ? 'flex' : 'hidden md:flex'"
    >
      <TicketList 
        :tickets="tickets" 
        :active-ticket="activeTicket" 
        :loading="loading" 
        is-admin
        @select="selectTicket"
      />
    </div>

    <!-- Colonne Droite -->
    <div class="flex-1 flex flex-col relative min-w-0 bg-white" :class="view !== 'list' ? 'flex' : 'hidden md:flex'">
        <Transition name="fade" mode="out-in">
            <ChatWindow 
                v-if="activeTicket" 
                key="chat"
                :ticket="activeTicket"
                :messages="messages"
                :loading-messages="loadingMessages"
                :current-user="user"
                is-admin
                @back="view = 'list'; activeTicket = null"
                @send-message="handleSendMessage"
                @change-status="changeStatus"
                @show-user="showUserModal = true"
            />

            <EmptyState 
                v-else 
                key="empty"
                is-admin
            />
        </Transition>
    </div>

    <!-- Modal User Details -->
    <UiModal :show="showUserModal" @close="showUserModal = false">
      <div class="bg-ui-surface border border-ui-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden" v-if="activeTicket?.expand?.user">
        <!-- Header -->
        <div class="bg-ui-surface-muted p-6 border-b border-ui-border flex items-start justify-between">
           <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-black shadow-sm border-2 border-white">
                 {{ activeTicket.expand.user.name?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div>
                 <h3 class="text-lg font-black text-ui-content">{{ activeTicket.expand.user.name || 'Utilisateur' }}</h3>
                 <p class="text-sm text-ui-content-muted font-medium">{{ activeTicket.expand.user.email }}</p>
                 <div class="mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border" :class="getRoleLabel(activeTicket.expand.user.role).class.replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-')">
                       {{ getRoleLabel(activeTicket.expand.user.role).label }}
                    </span>
                 </div>
              </div>
           </div>
           <button @click="showUserModal = false" class="text-ui-content-muted hover:text-ui-content"><Icon name="lucide:x" class="w-5 h-5" /></button>
        </div>

        <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">ID</p>
                    <p class="font-mono text-ui-content text-xs bg-ui-surface-muted p-1 rounded">{{ activeTicket.expand.user.id }}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Inscrit le</p>
                    <p class="text-ui-content">{{ new Date(activeTicket.expand.user.created).toLocaleDateString() }}</p>
                </div>
            </div>
            
            <div class="flex justify-end pt-2">
                <UiButton @click="navigateTo('/admin/users')" variant="secondary" size="sm">Voir gestion complète</UiButton>
            </div>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>