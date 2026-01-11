// composables/usePocketBase.ts
import PocketBase from 'pocketbase'

let pb: PocketBase | null = null

export const usePocketBase = () => {
  // Sur le client, on utilise une instance unique (Singleton) pour conserver le store d'auth
  if (import.meta.client) {
    if (!pb) pb = new PocketBase('http://127.0.0.1:8090')
    return pb
  }
  
  // Sur le serveur, on crée une nouvelle instance à chaque requête
  return new PocketBase('http://127.0.0.1:8090')
}

export const usePocketBaseUser = () => {
  const pb = usePocketBase()
  return useState('pb_user', () => pb.authStore.model)
}
