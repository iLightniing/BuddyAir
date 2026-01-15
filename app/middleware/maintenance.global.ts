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

  // Vérification de la fenêtre de maintenance
  const now = new Date().getTime()
  const start = settings.value.maintenance_start ? new Date(settings.value.maintenance_start).getTime() : 0
  const end = settings.value.maintenance_end ? new Date(settings.value.maintenance_end).getTime() : 0
  
  const isMaintenanceNow = settings.value.maintenance_active && now >= start && now <= end

  if (isMaintenanceNow) {
    // Sur le serveur, on ne connaît pas forcément l'utilisateur (sauf si cookies configurés).
    // On laisse le client faire la vérification pour éviter de bloquer l'admin par erreur au rafraîchissement.
    if (import.meta.server) return

    // Si l'utilisateur est admin (role 3), on laisse passer
    if (user.value && user.value.role === 3) return

    // On laisse l'accès UNIQUEMENT à la page de login pour que l'admin puisse se connecter
    if (to.path === '/auth/login') return

    // Sinon, redirection vers maintenance
    return navigateTo('/maintenance')
  }
})