<script setup lang="ts">
import { SUPPORT_STATUS_CONFIG } from '~/utils/supportConstants'

const props = defineProps<{
  ticket: any
  messages: any[]
  loadingMessages: boolean
  currentUser: any
  isAdmin?: boolean
}>()

const emit = defineEmits(['back', 'sendMessage', 'changeStatus', 'showUser'])

const messageInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const showImageModal = ref(false)
const previewImage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const openImage = (url: string) => {
    previewImage.value = url
    showImageModal.value = true
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const onSendMessage = () => {
    emit('sendMessage', messageInput.value, selectedFiles.value)
    messageInput.value = ''
    selectedFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
}

// Scroll auto
watch(() => props.messages, scrollToBottom, { deep: true })
onMounted(scrollToBottom)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header Chat -->
    <div class="p-4 border-b border-ui-border flex justify-between items-center bg-white/50 backdrop-blur z-10">
        <div class="flex items-center gap-3">
            <button @click="$emit('back')" class="p-2 -ml-2 text-ui-content-muted" :class="{ 'md:hidden': !isAdmin }"><Icon name="lucide:arrow-left" class="w-5 h-5" /></button>
            <div>
                <h3 class="font-bold text-ui-content flex items-center gap-2">
                    {{ ticket.subject }}
                    <span v-if="!isAdmin" class="text-[10px] px-2 py-0.5 rounded-full border" :class="SUPPORT_STATUS_CONFIG[ticket.status]?.class">{{ SUPPORT_STATUS_CONFIG[ticket.status]?.label }}</span>
                </h3>
                <p class="text-xs text-ui-content-muted flex items-center gap-1" :class="{'group cursor-pointer hover:text-blue-600 transition-colors': isAdmin}" @click="isAdmin ? $emit('showUser') : null">
                    <template v-if="isAdmin">
                        <Icon name="lucide:user" class="w-3 h-3" /> 
                        <span class="font-bold underline decoration-dotted">{{ ticket.expand?.user?.name || ticket.expand?.user?.email }}</span>
                        <Icon name="lucide:external-link" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span class="mx-1">•</span>
                    </template>
                    Ticket #{{ ticket.id.slice(-6) }}
                </p>
            </div>
        </div>
        
        <!-- Actions Admin -->
        <div v-if="isAdmin" class="flex items-center gap-2">
            <div class="w-56">
                <UiSelect 
                    :model-value="ticket.status" 
                    @update:model-value="v => $emit('changeStatus', v)"
                    :options="Object.entries(SUPPORT_STATUS_CONFIG).map(([k, v]: [string, any]) => ({ value: k, label: v.label }))" 
                />
            </div>
        </div>
    </div>

    <!-- Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 flex flex-col">
        <div v-if="loadingMessages" class="flex justify-center py-4"><Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-blue-500" /></div>
        
        <div 
            v-for="msg in messages" 
            :key="msg.id" 
            class="flex gap-4 max-w-[85%]"
            :class="msg.sender === currentUser?.id ? 'self-end flex-row-reverse' : 'self-start'"
        >
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden" :class="msg.sender === currentUser?.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'">
                <template v-if="msg.sender === currentUser?.id">
                    <img v-if="currentUser?.avatar" :src="`http://127.0.0.1:8090/api/files/users/${currentUser.id}/${currentUser.avatar}`" class="w-full h-full object-cover" />
                    <span v-else>{{ currentUser?.name?.[0] || currentUser?.email?.[0]?.toUpperCase() || '?' }}</span>
                </template>
                <template v-else>
                    <template v-if="msg.expand?.sender">
                        <img v-if="msg.expand.sender.avatar" :src="`http://127.0.0.1:8090/api/files/users/${msg.expand.sender.id}/${msg.expand.sender.avatar}`" class="w-full h-full object-cover" />
                        <span v-else>{{ msg.expand.sender.role === 3 ? 'A' : (msg.expand.sender.name?.[0] || '?') }}</span>
                    </template>
                    <template v-else>
                        <div v-if="!isAdmin" class="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600"><Icon name="lucide:headset" class="w-4 h-4" /></div>
                        <span v-else>?</span>
                    </template>
                </template>
            </div>
            
            <div class="space-y-1">
                <div class="flex items-center gap-2 mb-1" :class="msg.sender === currentUser?.id ? 'justify-end' : ''">
                    <span class="text-[10px] font-bold text-ui-content-muted">
                        <template v-if="msg.expand?.sender">
                            {{ msg.expand.sender.role === 3 ? 'Support BuddyAir' : (msg.expand.sender.name || 'Utilisateur') }}
                        </template>
                        <template v-else>
                            {{ !isAdmin ? 'Support BuddyAir' : 'Utilisateur' }}
                        </template>
                    </span>
                </div>
                <div 
                    class="p-4 rounded-2xl text-sm shadow-sm whitespace-pre-wrap"
                    :class="msg.sender === currentUser?.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-ui-border text-ui-content rounded-tl-none'"
                >
                    {{ msg.content }}
                </div>
                
                <!-- Attachments -->
                <div v-if="msg.attachments && msg.attachments.length > 0" class="flex gap-2 mt-2 flex-wrap" :class="msg.sender === currentUser?.id ? 'justify-end' : ''">
                    <div v-for="file in msg.attachments" :key="file" class="relative group cursor-pointer" @click="openImage(`http://127.0.0.1:8090/api/files/ticket_messages/${msg.id}/${file}`)">
                        <img :src="`http://127.0.0.1:8090/api/files/ticket_messages/${msg.id}/${file}`" class="w-20 h-20 object-cover rounded-lg border border-ui-border hover:opacity-90 transition-opacity" />
                    </div>
                </div>

                <p class="text-[10px] text-ui-content-muted opacity-60 px-1" :class="msg.sender === currentUser?.id ? 'text-right' : 'text-left'">
                    {{ new Date(msg.created).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
                </p>
            </div>
        </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 bg-white border-t border-ui-border" v-if="ticket.status !== 'closed'">
        <div class="flex gap-2 items-end bg-ui-surface border border-ui-border rounded-2xl p-2 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <button @click="fileInput?.click()" class="p-2 text-ui-content-muted hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0">
                <Icon name="lucide:paperclip" class="w-5 h-5" />
            </button>
            <input type="file" ref="fileInput" multiple accept="image/*" class="hidden" @change="handleFileSelect" />
            
            <textarea 
                v-model="messageInput" 
                @keydown.enter.exact.prevent="onSendMessage"
                rows="1" 
                class="flex-1 bg-transparent border-none outline-none text-sm py-2 max-h-32 resize-none" 
                placeholder="Répondre..."
                style="min-height: 40px;"
            ></textarea>
            
            <button 
                @click="onSendMessage" 
                :disabled="!messageInput.trim() && selectedFiles.length === 0"
                class="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
            >
                <Icon name="lucide:send" class="w-5 h-5" />
            </button>
        </div>
        
        <!-- Preview Files -->
        <div v-if="selectedFiles.length > 0" class="flex gap-2 mt-3 overflow-x-auto pb-2">
            <div v-for="(file, index) in selectedFiles" :key="index" class="relative shrink-0">
                <div class="w-16 h-16 bg-slate-100 rounded-lg border border-ui-border flex items-center justify-center overflow-hidden">
                    <Icon name="lucide:image" class="w-6 h-6 text-slate-400" />
                </div>
                <button @click="selectedFiles.splice(index, 1)" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform">
                    <Icon name="lucide:x" class="w-3 h-3" />
                </button>
            </div>
        </div>
    </div>
    <div v-else class="p-4 bg-gray-50 border-t border-ui-border text-center text-sm text-gray-500">
        Ce ticket est fermé. Vous ne pouvez plus y répondre.
    </div>

    <!-- Modal Image Preview -->
    <UiModal :show="showImageModal" @close="showImageModal = false">
        <div class="relative bg-transparent shadow-none border-none p-0 max-w-5xl w-full flex justify-center">
            <img :src="previewImage" class="max-h-[90vh] max-w-full rounded-lg shadow-2xl" />
            <button @click="showImageModal = false" class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur">
                <Icon name="lucide:x" class="w-6 h-6" />
            </button>
        </div>
    </UiModal>
  </div>
</template>