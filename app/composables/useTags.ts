import { ref } from 'vue'

export const useTags = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()

  const tags = useState<any[]>('tags', () => [])
  const loading = useState<boolean>('tags_loading', () => false)

  // Palette de couleurs système
  const colors = [
    { name: 'Rouge', value: 'red', class: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Ambre', value: 'amber', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Vert', value: 'emerald', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Bleu', value: 'blue', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'Violet', value: 'purple', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Rose', value: 'pink', class: 'bg-pink-50 text-pink-700 border-pink-200' },
    { name: 'Gris', value: 'slate', class: 'bg-slate-50 text-slate-700 border-slate-200' },
  ]

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
    return colors.find(c => c.value === colorValue)?.class || colors[8].class // Gris par défaut
  }

  return { tags, loading, colors, fetchTags, saveTag, deleteTag, getTagClass }
}