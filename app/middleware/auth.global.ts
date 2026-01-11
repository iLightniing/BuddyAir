export default defineNuxtRouteMiddleware((to) => {
  const session = useSupabaseSession()

  // On laisse la page de confirmation gérer sa propre logique de redirection complexe
  if (to.path === PATHS.CONFIRM) return

  // 1. Gestion de la racine (/) : Aiguillage direct
  if (to.path === PATHS.HOME) {
    return navigateTo(session.value ? PATHS.DASHBOARD : PATHS.LOGIN, { replace: true })
  }

  // 2. Zone Invité (Login, Register, Forgot Password)
  const isGuestPage = to.path.startsWith(PATHS.AUTH) && to.path !== PATHS.UPDATE_PASSWORD
  if (isGuestPage && session.value) {
    return navigateTo(PATHS.DASHBOARD, { replace: true })
  }

  // 3. Zone Authentifiée (Dashboard, Update Password)
  const isProtectedPage = to.path.startsWith(PATHS.DASHBOARD) || to.path === PATHS.UPDATE_PASSWORD
  if (isProtectedPage && !session.value) {
    return navigateTo(PATHS.LOGIN, { replace: true })
  }
})