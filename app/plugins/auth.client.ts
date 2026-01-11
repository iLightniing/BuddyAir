// app/plugins/auth.client.ts
export default defineNuxtPlugin(() => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()

  // On restaure l'utilisateur depuis le store PocketBase (localStorage)
  // immédiatement au démarrage, avant que le middleware ne s'exécute.
  if (pb.authStore.isValid) {
    user.value = pb.authStore.model
  }
})
