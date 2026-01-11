export default defineNuxtRouteMiddleware((to) => {
  const user = usePocketBaseUser()

  // On laisse la page de confirmation gérer sa propre logique de redirection complexe
  if (to.path === PATHS.CONFIRM) return

  // 1. Gestion de la racine (/) : Aiguillage direct
  if (to.path === PATHS.HOME) {
    return navigateTo(user.value ? PATHS.DASHBOARD : PATHS.LOGIN, { replace: true })
  }

  // 2. Zone Invité (Login, Register, Forgot Password)
  const isGuestPage = to.path.startsWith(PATHS.AUTH) && to.path !== PATHS.UPDATE_PASSWORD
  if (isGuestPage && user.value) {
    return navigateTo(PATHS.DASHBOARD, { replace: true })
  }

  // 3. Zone Authentifiée (Dashboard, Update Password)
  const isProtectedPage = to.path.startsWith(PATHS.DASHBOARD) || to.path === PATHS.UPDATE_PASSWORD
  if (isProtectedPage && !user.value) {
    // Sur le serveur, on ne peut pas vérifier le localStorage.
    // On laisse passer pour éviter de rediriger vers le login par erreur.
    // Le client fera la vérification finale.
    if (import.meta.server) return
    return navigateTo(PATHS.LOGIN, { replace: true })
  }
})