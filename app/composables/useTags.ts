import { ref } from 'vue'
import { TAG_COLORS } from '~/utils/constants'

export const useTags = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()

  const tags = useState<any[]>('tags', () => [])
  const loading = useState<boolean>('tags_loading', () => false)

  // Palette de couleurs système
  const colors = TAG_COLORS

  const fetchTags = async () => {
    loading.value = true
    const user = pb.authStore.model
    if (!user) return

    try {
      const result = await pb.collection('tags').getFullList({ sort: '+order' })
      tags.value = result
    } catch (e) {
      // Silent fail si la collection n'existe pas encore
    } finally {
      loading.value = false
    }
  }

  const saveTag = async (tag: any) => {
    const user = pb.authStore.model
    if (!user) return false

    try {
      const data = {
        user: user.id,
        name: tag.name,
        color: tag.color
      }

      if (tag.id) {
        await pb.collection('tags').update(tag.id, data)
        notify('Étiquette modifiée', 'success')
      } else {
        await pb.collection('tags').create(data)
        notify('Étiquette créée', 'success')
      }
      await fetchTags()
      return true
    } catch (e) {
      notify('Erreur lors de la sauvegarde', 'error')
      return false
    }
  }

  const deleteTag = async (id: string) => {
    try {
      await pb.collection('tags').delete(id)
      notify('Étiquette supprimée', 'success')
      tags.value = tags.value.filter(t => t.id !== id)
    } catch (e) {
      notify('Erreur lors de la suppression', 'error')
    }
  }

  const getTagClass = (colorValue: string) => {
    return colors.find(c => c.value === colorValue)?.class || colors[8]?.class || '' // Gris par défaut
  }

  return { tags, loading, colors, fetchTags, saveTag, deleteTag, getTagClass }
}