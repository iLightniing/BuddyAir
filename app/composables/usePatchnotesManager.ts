import { PATCHNOTE_TYPES, ROADMAP_STATUSES } from '~/utils/constants'

export const usePatchnotesManager = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  
  const patchnotes = ref<any[]>([])
  const roadmap = ref<any[]>([])
  const loading = ref(true)
  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const itemToDelete = ref<any>(null)
  const deleteType = ref<'patchnote' | 'roadmap'>('patchnote')

  const form = ref({
    id: '',
    version: '',
    title: '',
    content: '',
    type: 'feature',
    items: [{ type: 'feature', text: '' }] // Liste des changements
  })

  // Roadmap Form
  const showRoadmapModal = ref(false)
  const roadmapForm = ref({
    id: '',
    title: '',
    description: '',
    status: 'planned'
  })

  const types = PATCHNOTE_TYPES
  const roadmapStatuses = ROADMAP_STATUSES

  const fetchPatchnotes = async () => {
    loading.value = true
    try {
      const [notesResult, roadmapResult] = await Promise.all([
        pb.collection('patchnotes').getList(1, 50, { sort: '-created' }),
        pb.collection('roadmap').getFullList({ sort: '-created' }).catch(() => [])
      ])
      patchnotes.value = notesResult.items
      roadmap.value = roadmapResult
    } catch (e) {
      // Silent fail si la collection n'existe pas encore
    } finally {
      loading.value = false
    }
  }

  const openModal = (item?: any) => {
    if (item) {
      let items = []
      try {
        // On essaie de lire le contenu comme du JSON (nouveau format)
        items = JSON.parse(item.content)
        if (!Array.isArray(items)) throw new Error()
      } catch (e) {
        // Fallback pour les anciens patchnotes (HTML brut)
        // On nettoie un peu les balises HTML pour récupérer le texte
        const text = item.content.replace(/<[^>]*>?/gm, '')
        items = [{ type: 'feature', text: text || item.content }]
      }
      form.value = { ...item, items }
    } else {
      form.value = { id: '', version: '', title: '', content: '', type: 'feature', items: [{ type: 'feature', text: '' }] }
    }
    showModal.value = true
  }

  const openRoadmapModal = (item?: any) => {
    if (item) {
      roadmapForm.value = { ...item }
    } else {
      roadmapForm.value = { id: '', title: '', description: '', status: 'planned' }
    }
    showRoadmapModal.value = true
  }

  const save = async () => {
    try {
      // On sauvegarde la liste sous forme de JSON dans le champ content
      const content = JSON.stringify(form.value.items.filter(i => i.text.trim() !== ''))
      const data = { 
          ...form.value,
          content
      }
      
      if (form.value.id) {
        await pb.collection('patchnotes').update(form.value.id, data)
        notify('Patchnote mis à jour', 'success')
      } else {
        await pb.collection('patchnotes').create(data)
        notify('Patchnote publié', 'success')
      }
      showModal.value = false
      fetchPatchnotes()
    } catch (e) {
      notify('Erreur lors de la sauvegarde', 'error')
    }
  }

  const saveRoadmap = async () => {
    try {
      const data = { ...roadmapForm.value }
      if (roadmapForm.value.id) {
        await pb.collection('roadmap').update(roadmapForm.value.id, data)
        notify('Roadmap mise à jour', 'success')
      } else {
        await pb.collection('roadmap').create(data)
        notify('Fonctionnalité ajoutée à la roadmap', 'success')
      }
      showRoadmapModal.value = false
      fetchPatchnotes()
    } catch (e) {
      notify('Erreur lors de la sauvegarde', 'error')
    }
  }

  const requestDeletePatchnote = (item: any) => {
    itemToDelete.value = item
    deleteType.value = 'patchnote'
    showDeleteModal.value = true
  }

  const requestDeleteRoadmapItem = (item: any) => {
    itemToDelete.value = item
    deleteType.value = 'roadmap'
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!itemToDelete.value) return
    try {
      if (deleteType.value === 'patchnote') {
        await pb.collection('patchnotes').delete(itemToDelete.value.id)
        notify('Patchnote supprimé', 'success')
      } else {
        await pb.collection('roadmap').delete(itemToDelete.value.id)
        notify('Élément supprimé', 'success')
      }
      showDeleteModal.value = false
      fetchPatchnotes()
    } catch (e) {
      notify('Erreur lors de la suppression', 'error')
    }
  }

  return {
    patchnotes, roadmap, loading,
    showModal, showDeleteModal, itemToDelete, deleteType, form, types,
    showRoadmapModal, roadmapForm, roadmapStatuses,
    fetchPatchnotes, openModal, save, confirmDelete,
    openRoadmapModal, saveRoadmap, requestDeletePatchnote, requestDeleteRoadmapItem
  }
}