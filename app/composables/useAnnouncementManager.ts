import { ref } from 'vue'
import { useAnnouncements } from '~/composables/useAnnouncements'

export const useAnnouncementManager = () => {
  const { announcements, loading, fetchAll, save, remove, toggleActive } = useAnnouncements()

  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const itemToDelete = ref<any>(null)
  const newMessage = ref('')

  // Formulaire d'édition
  const editForm = ref({
    id: '',
    message: ''
  })

  const createAnnouncement = async () => {
    if (!newMessage.value.trim()) return
    
    const success = await save({
      message: newMessage.value,
      is_active: false, // Par défaut inactif
      title: 'Information',
      type: 'warning'
    })
    
    if (success) {
      newMessage.value = ''
      fetchAll()
    }
  }

  const openEditModal = (item: any) => {
    editForm.value = { id: item.id, message: item.message }
    showEditModal.value = true
  }

  const handleUpdate = async () => {
    const success = await save({ id: editForm.value.id, message: editForm.value.message })
    if (success) {
      showEditModal.value = false
      fetchAll()
    }
  }

  const requestDelete = (item: any) => {
    itemToDelete.value = item
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (itemToDelete.value) {
      await remove(itemToDelete.value.id)
      showDeleteModal.value = false
      fetchAll()
    }
  }

  const init = () => {
    fetchAll()
  }

  return {
    announcements,
    loading,
    newMessage,
    showEditModal,
    showDeleteModal,
    editForm,
    createAnnouncement,
    openEditModal,
    handleUpdate,
    requestDelete,
    confirmDelete,
    toggleActive,
    init
  }
}