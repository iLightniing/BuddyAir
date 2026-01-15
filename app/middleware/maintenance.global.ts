import { useSystemSettings } from '~/composables/useSystemSettings'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // On évite la boucle infinie si on est déjà sur la page de maintenance
  if (to.path === '/maintenance') return

  const { settings, fetchSettings } = useSystemSettings()
  const user = usePocketBaseUser()

  // On s'assure d'avoir les settings à jour
  if (!settings.value.id) {
    await fetchSettings()
  }

  // Si maintenance active
  if (settings.value.maintenance_mode) {
    // Si l'utilisateur est admin (role 3), on laisse passer
    if (user.value && user.value.role === 3) return

    // Si on essaie d'accéder au login, on laisse passer (pour que l'admin puisse se connecter)
    if (to.path.startsWith('/auth')) return

    // Sinon, redirection vers maintenance
    return navigateTo('/maintenance')
  }
})