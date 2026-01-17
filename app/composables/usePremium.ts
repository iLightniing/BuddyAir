// app/composables/usePremium.ts
export const usePremium = () => {
  const user = usePocketBaseUser()
  
  // 1 = Free, 2 = Premium, 3 = Admin
  const isPremium = computed(() => {
    if (!user.value) return false
    
    // 1. Si Admin (Role 3), toujours Premium
    if (user.value.role === 3) return true

    // 2. Si Role < 2, pas Premium
    if (user.value.role < 2) return false

    // 3. Si Role 2 (Premium), on vérifie la date d'expiration
    // Cela permet de gérer le cas où le webhook de downgrade n'est pas encore passé
    if (user.value.current_period_end) {
        const endDate = new Date(user.value.current_period_end)
        const now = new Date()
        
        // Si la date est passée, on considère qu'il n'est plus premium visuellement
        // même si la base de données dit encore "role: 2"
        if (endDate < now) return false
    }

    return true
  })
  
  // État global pour la modale d'abonnement
  const showPremiumModal = useState('show_premium_modal', () => false)

  const openPremiumModal = () => {
    showPremiumModal.value = true
  }

  return {
    isPremium,
    showPremiumModal,
    openPremiumModal
  }
}