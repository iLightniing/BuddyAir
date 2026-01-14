import { USER_ROLES } from '~/utils/constants'

export const useUsersManager = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const loading = ref(true)
  const users = ref<any[]>([])

  // États des modales
  const showViewModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const selectedUser = ref<any>(null)

  // Formulaire d'édition
  const editForm = ref({
    role: 1
  })

  const roles = USER_ROLES

  const fetchUsers = async () => {
    loading.value = true
    try {
      const result = await pb.collection('users').getList(1, 100, {
        sort: '-created'
      })
      users.value = result.items
    } catch (e: any) {
      notify("Erreur lors du chargement des utilisateurs", "error")
    } finally {
      loading.value = false
    }
  }

  const getRoleLabel = (role: number) => {
    return roles.find(r => r.value === role) || roles[0]!
  }

  const handleView = (user: any) => {
    selectedUser.value = user
    showViewModal.value = true
  }

  const handleEdit = (user: any) => {
    selectedUser.value = user
    editForm.value.role = user.role || 1
    showViewModal.value = false
    showEditModal.value = true
  }

  const handleDelete = (user: any) => {
    selectedUser.value = user
    showViewModal.value = false
    showDeleteModal.value = true
  }

  const saveRole = async () => {
    if (!selectedUser.value) return
    try {
      await pb.collection('users').update(selectedUser.value.id, {
        role: editForm.value.role
      })
      notify("Rôle mis à jour avec succès", "success")
      showEditModal.value = false
      fetchUsers()
    } catch (e) {
      notify("Erreur lors de la mise à jour", "error")
    }
  }

  const confirmDelete = async () => {
    if (!selectedUser.value) return
    try {
      await pb.collection('users').delete(selectedUser.value.id)
      notify("Utilisateur supprimé définitivement", "success")
      showDeleteModal.value = false
      fetchUsers()
    } catch (e) {
      notify("Erreur lors de la suppression", "error")
    }
  }

  return {
    loading, users, showViewModal, showEditModal, showDeleteModal, selectedUser, editForm, roles,
    fetchUsers, getRoleLabel, handleView, handleEdit, handleDelete, saveRole, confirmDelete
  }
}