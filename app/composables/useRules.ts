import { ref } from 'vue'

export const useRules = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  
  const rules = useState<any[]>('rules', () => [])
  const loading = useState<boolean>('rules_loading', () => false)

  const fetchRules = async () => {
    loading.value = true
    const user = pb.authStore.model
    if (!user) return

    try {
      // On suppose une collection 'transaction_rules'
      // Champs : user, name, keywords (text), category (text), is_active (bool)
      const result = await pb.collection('transaction_rules').getFullList({
        sort: '-created',
      })
      rules.value = result
    } catch (e) {
      // Fallback silencieux si la collection n'existe pas encore
      console.warn("Collection 'transaction_rules' non trouvée ou vide.")
    } finally {
      loading.value = false
    }
  }

  const saveRule = async (rule: any) => {
    const user = pb.authStore.model
    if (!user) return

    try {
      const data = {
        user: user.id,
        name: rule.name,
        keywords: rule.keywords, // Stocké sous forme de texte "netflix, spotify"
        category: rule.category,
        sub_category: rule.sub_category,
        is_active: rule.is_active
      }

      if (rule.id) {
        await pb.collection('transaction_rules').update(rule.id, data)
        notify('Règle mise à jour', 'success')
      } else {
        await pb.collection('transaction_rules').create(data)
        notify('Règle créée', 'success')
      }
      await fetchRules()
      return true
    } catch (e) {
      notify('Erreur lors de la sauvegarde', 'error')
      return false
    }
  }

  const deleteRule = async (id: string) => {
    try {
      await pb.collection('transaction_rules').delete(id)
      notify('Règle supprimée', 'success')
      rules.value = rules.value.filter(r => r.id !== id)
    } catch (e) {
      notify('Erreur lors de la suppression', 'error')
    }
  }

  // Fonction utilitaire pour appliquer les règles sur une transaction (à utiliser lors de l'import)
  const applyRules = (description: string) => {
    if (!description) return null
    
    const descLower = description.toLowerCase()
    
    // On cherche la première règle active qui matche
    const match = rules.value.find(r => {
      if (!r.is_active || !r.keywords) return false
      const keywords = r.keywords.split(',').map((k: string) => k.trim().toLowerCase())
      return keywords.some((k: string) => k && descLower.includes(k))
    })

    return match ? { category: match.category, sub_category: match.sub_category } : null
  }

  return {
    rules,
    loading,
    fetchRules,
    saveRule,
    deleteRule,
    applyRules
  }
}