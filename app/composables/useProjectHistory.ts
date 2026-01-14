export const useProjectHistory = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()

  const showHistoryModal = ref(false)
  const historyProject = ref<any>(null)
  const historyTransactions = ref<any[]>([])
  const historyLoading = ref(false)

  const openHistoryModal = async (project: any) => {
    if (!user.value) return

    historyProject.value = project
    showHistoryModal.value = true
    historyLoading.value = true
    historyTransactions.value = []
    
    try {
      const result = await pb.collection('transactions').getList(1, 50, {
        filter: `user = "${user.value.id}" && category = "Épargne" && description ~ "${project.name}"`,
        sort: '-date',
        requestKey: null
      })
      historyTransactions.value = result.items.map(t => ({ ...t }))
    } catch (e) {
      console.error(e)
    } finally { historyLoading.value = false }
  }

  return { showHistoryModal, historyProject, historyTransactions, historyLoading, openHistoryModal }
}