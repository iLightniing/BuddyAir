<script setup lang="ts">
import { SUPPORT_STATUS_CONFIG, SUPPORT_CATEGORIES } from '~/utils/supportConstants'

defineProps<{
  tickets: any[]
  activeTicket: any
  loading: boolean
  isAdmin?: boolean
  currentUser?: any
}>()

defineEmits(['select', 'create'])
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 border-b border-ui-border flex justify-between items-center">
      <h2 class="font-black text-ui-content text-lg">{{ isAdmin ? 'Tickets Support' : 'Mes demandes' }}</h2>
      
      <div v-if="isAdmin" class="text-xs font-bold text-ui-content-muted bg-ui-surface px-2 py-1 rounded-md border border-ui-border">
          {{ tickets.length }}
      </div>
      <button v-else @click="$emit('create')" class="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95" title="Nouveau ticket">
        <Icon name="lucide:plus" class="w-5 h-5" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-2">
      <div v-if="loading" class="p-8 flex justify-center"><Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-blue-500" /></div>
      <div v-else-if="tickets.length === 0" class="p-8 text-center text-ui-content-muted text-sm">
          {{ isAdmin ? 'Aucun ticket.' : 'Aucune demande en cours.' }}
      </div>
      
      <button 
        v-for="ticket in tickets" 
        :key="ticket.id"
        @click="$emit('select', ticket)"
        class="w-full text-left p-3 rounded-xl transition-all border border-transparent group relative"
        :class="activeTicket?.id === ticket.id ? 'bg-white shadow-sm border-ui-border' : 'hover:bg-white/50 hover:border-ui-border/50'"
      >
        <!-- Admin View -->
        <template v-if="isAdmin">
            <div class="flex justify-between items-start mb-1">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden">
                        <img v-if="ticket.expand?.user?.avatar" :src="`http://127.0.0.1:8090/api/files/users/${ticket.expand.user.id}/${ticket.expand.user.avatar}`" class="w-full h-full object-cover" />
                        <span v-else>{{ ticket.expand?.user?.name?.[0] || 'U' }}</span>
                    </div>
                    <span class="text-xs font-bold text-ui-content truncate max-w-[100px]">{{ ticket.expand?.user?.name || ticket.expand?.user?.email }}</span>
                </div>
                <span class="text-[10px] text-ui-content-muted">{{ new Date(ticket.last_message_at).toLocaleDateString() }}</span>
            </div>
            <h3 class="font-bold text-ui-content truncate pr-4 mt-1">{{ ticket.subject }}</h3>
            <div class="flex justify-between items-center mt-2">
                <div class="flex items-center gap-1 text-xs text-ui-content-muted">
                    <Icon :name="SUPPORT_CATEGORIES[ticket.category]?.icon || 'lucide:help-circle'" class="w-3 h-3" />
                    {{ SUPPORT_CATEGORIES[ticket.category]?.label }}
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="SUPPORT_STATUS_CONFIG[ticket.status]?.class || 'bg-gray-100'">
                    {{ SUPPORT_STATUS_CONFIG[ticket.status]?.label }}
                </span>
            </div>
        </template>

        <!-- User View -->
        <template v-else>
            <div class="flex justify-between items-start mb-1">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                        <img v-if="currentUser?.avatar" :src="`http://127.0.0.1:8090/api/files/users/${currentUser.id}/${currentUser.avatar}`" class="w-full h-full object-cover" />
                        <span v-else>{{ currentUser?.name?.[0] || currentUser?.email?.[0].toUpperCase() }}</span>
                    </div>
                    <span class="text-xs font-bold text-ui-content truncate max-w-[120px]">{{ ticket.subject }}</span>
                </div>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="SUPPORT_STATUS_CONFIG[ticket.status]?.class || 'bg-gray-100'">
                    {{ SUPPORT_STATUS_CONFIG[ticket.status]?.label }}
                </span>
            </div>
            <div class="flex items-center gap-1 text-xs text-ui-content-muted mt-1">
                <Icon :name="SUPPORT_CATEGORIES[ticket.category]?.icon || 'lucide:help-circle'" class="w-3 h-3" />
                {{ SUPPORT_CATEGORIES[ticket.category]?.label }}
                <span class="ml-auto text-[10px]">{{ new Date(ticket.last_message_at).toLocaleDateString() }}</span>
            </div>
        </template>
      </button>
    </div>
  </div>
</template>