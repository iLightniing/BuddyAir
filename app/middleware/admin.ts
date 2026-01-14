export default defineNuxtRouteMiddleware((to) => {
  const user = usePocketBaseUser()
  
  const ROLE_ADMIN = 3
  
  if (user.value?.role !== ROLE_ADMIN) {
    return navigateTo('/dashboard')
  }
})