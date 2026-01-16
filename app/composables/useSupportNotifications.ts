import { ref, watch } from 'vue'

export const useSupportNotifications = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  
  // Global state for notifications
  const hasUnreadSupport = useState<boolean>('has_unread_support', () => false)
  const hasAdminSupport = useState<boolean>('has_admin_support', () => false)

  const checkNotifications = async () => {
    if (!user.value) return

    try {
      if (user.value.role === 3) {
        // Admin: Check for unread tickets
        const result = await pb.collection('tickets').getList(1, 1, {
          filter: 'is_read_by_admin = false',
          fields: 'id'
        })
        hasAdminSupport.value = result.totalItems > 0
      }

      // User: Check for unread tickets
      const result = await pb.collection('tickets').getList(1, 1, {
        filter: `user = "${user.value.id}" && is_read_by_user = false`,
        fields: 'id'
      })
      hasUnreadSupport.value = result.totalItems > 0

    } catch (e) {
      // Silent fail
    }
  }

  const init = () => {
    checkNotifications()
    
    // Subscribe to tickets to update notifications in realtime
    pb.collection('tickets').subscribe('*', () => {
      checkNotifications()
    })
  }

  // Re-vérifier quand l'utilisateur change (ex: connexion/hydratation)
  watch(user, checkNotifications)

  return {
    hasUnreadSupport,
    hasAdminSupport,
    init,
    checkNotifications
  }
}