// app/middleware/premium.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = usePocketBaseUser()
  
  // Si l'utilisateur n'est pas connecté ou n'est pas au moins Premium (role 2)
  if (!user.value || user.value.role < 2) {
    return navigateTo('/dashboard')
  }
})