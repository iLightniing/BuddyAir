export default defineNuxtPlugin((nuxtApp) => {
  const { error } = useLogger()

  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    // On garde l'erreur dans la console pour le développement local
    console.error('[BuddyAir Auto-Log]', err)

    // On envoie à PocketBase
    error(err instanceof Error ? err.message : String(err), {
      stack: err instanceof Error ? err.stack : null,
      component: instance?.$options?.__name || 'Unknown Component',
      info,
      url: window.location.href
    })
  }
})