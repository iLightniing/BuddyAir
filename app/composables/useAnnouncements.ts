import { ref } from 'vue'

export const useAnnouncements = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  
  const announcements = ref<any[]>([])
  const activeAnnouncement = useState<any>('active_announcement', () => null)
  const loading = ref(false)

  // Admin: Récupérer toutes les annonces
  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await pb.collection('announcements').getFullList({ sort: '-created' })
      announcements.value = result
      console.log('Annonces chargées:', result)
    } catch (e) {
      // Silent fail si la collection n'existe pas encore
      console.error('Erreur chargement annonces:', e)
    } finally {
      loading.value = false
    }
  }

  // User: Récupérer l'annonce active
  const fetchActive = async () => {
    try {
      // On cherche la dernière annonce active
      const result = await pb.collection('announcements').getFirstListItem(
        `is_active = true`,
        { sort: '-created' }
      )
      console.log('Annonce active trouvée:', result)
      activeAnnouncement.value = result
    } catch (e) {
      activeAnnouncement.value = null
      // Pas d'annonce active ou erreur
    }
  }

  const toggleActive = async (item: any) => {
    try {
      // On désactive toutes les autres annonces pour n'en avoir qu'une seule active à la fois (optionnel mais recommandé)
      // Ici on fait simple : on toggle juste celle-ci
      await pb.collection('announcements').update(item.id, { is_active: !item.is_active })
      await fetchAll() // Rafraîchir la liste admin
      await fetchActive() // Rafraîchir le bandeau
    } catch (e) {
      notify('Erreur lors du changement de statut', 'error')
    }
  }

  const save = async (data: any) => {
    try {
      if (data.id) {
        await pb.collection('announcements').update(data.id, data)
        notify('Annonce mise à jour', 'success')
      } else {
        await pb.collection('announcements').create(data)
        notify('Annonce créée', 'success')
      }
      await fetchActive()
      return true
    } catch (e) {
      notify('Erreur lors de la sauvegarde', 'error')
      return false
    }
  }

  const remove = async (id: string) => {
    try {
      await pb.collection('announcements').delete(id)
      notify('Annonce supprimée', 'success')
      await fetchActive()
      return true
    } catch (e) {
      notify('Erreur lors de la suppression', 'error')
      return false
    }
  }

  return {
    announcements,
    activeAnnouncement,
    loading,
    fetchAll,
    fetchActive,
    save,
    remove,
    toggleActive
  }
}