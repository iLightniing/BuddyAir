import { ref, nextTick, watch, type Ref } from 'vue'

export const useSupportUI = (activeTicket: Ref<any>, messages: Ref<any[]>) => {
  const view = ref<'list' | 'chat' | 'new'>('list')
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

  const resetMessageInput = () => {
    messageInput.value = ''
    selectedFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
  }

  // Automatismes UI
  watch(activeTicket, (val) => {
    if (val) {
        view.value = 'chat'
        scrollToBottom()
    }
  })

  watch(messages, scrollToBottom, { deep: true })

  return {
    view,
    messageInput,
    fileInput,
    selectedFiles,
    showImageModal,
    previewImage,
    messagesContainer,
    handleFileSelect,
    openImage,
    scrollToBottom,
    resetMessageInput
  }
}