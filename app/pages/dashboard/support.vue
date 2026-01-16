<script setup lang="ts">
import TicketList from '~/components/dashboard/support/TicketList.vue'
import ChatWindow from '~/components/dashboard/support/ChatWindow.vue'
import NewTicketForm from '~/components/dashboard/support/NewTicketForm.vue'
import EmptyState from '~/components/dashboard/support/EmptyState.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Support Client'
})

const { 
  tickets, activeTicket, messages, loading, loadingMessages, sending,
  fetchTickets, createTicket, selectTicket, sendMessage 
} = useSupport(false)

const user = usePocketBaseUser()
const view = ref<'list' | 'chat' | 'new'>('list')

const handleCreateTicket = async (data: any, files: File[]) => {
  const ticket = await createTicket(data, files)
  if (ticket) {
    selectTicket(ticket)
    view.value = 'chat'
  }
}

const handleSendMessage = async (content: string, files: File[]) => {
  if (!activeTicket.value) return
  await sendMessage(activeTicket.value.id, content, files)
}

// Responsive
watch(activeTicket, (val) => {
  if (val) view.value = 'chat'
})

onMounted(fetchTickets)
watch(user, () => fetchTickets(), { deep: true })
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
        :current-user="user"
        @select="selectTicket"
        @create="view = 'new'; activeTicket = null"
      />
    </div>

    <!-- Colonne Droite -->
    <div class="flex-1 flex flex-col relative min-w-0 bg-white" :class="view !== 'list' ? 'flex' : 'hidden md:flex'">
        <Transition name="fade" mode="out-in">
            <NewTicketForm 
                v-if="view === 'new'" 
                key="new"
                :sending="sending"
                @cancel="view = 'list'"
                @create="handleCreateTicket"
            />

            <ChatWindow 
                v-else-if="activeTicket" 
                key="chat"
                :ticket="activeTicket"
                :messages="messages"
                :loading-messages="loadingMessages"
                :current-user="user"
                @back="view = 'list'; activeTicket = null"
                @send-message="handleSendMessage"
            />

            <EmptyState 
                v-else 
                key="empty"
                @create="view = 'new'"
            />
        </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>