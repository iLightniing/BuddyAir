export const useLogger = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const route = useRoute()

  const log = async (level: 'info' | 'warn' | 'error' | 'debug', message: string, data: any = null) => {
    try {
      // On évite de logger si on n'est pas connecté ou si PB n'est pas prêt, 
      // sauf si c'est une erreur critique qu'on veut tenter de sauver.
      
      await pb.collection('logs').create({
        level,
        message,
        data: data ? JSON.parse(JSON.stringify(data)) : {}, // Nettoyage des proxies Vue
        user: user.value?.id || null,
        context: route.path,
        user_agent: import.meta.client ? navigator.userAgent : 'Server'
      })
    } catch (e) {
      // Fallback console si l'envoi échoue (pour éviter une boucle infinie d'erreurs)
      console.error('Impossible d\'envoyer le log à PocketBase:', e)
      console.log('[Local Log]', level, message, data)
    }
  }

  return {
    info: (msg: string, data?: any) => log('info', msg, data),
    warn: (msg: string, data?: any) => log('warn', msg, data),
    error: (msg: string, data?: any) => log('error', msg, data),
    debug: (msg: string, data?: any) => log('debug', msg, data),
  }
}