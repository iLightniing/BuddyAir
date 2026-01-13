export default defineNuxtRouteMiddleware((to) => {
  const user = usePocketBaseUser()
  
  if (user.value?.role !== 3) {
    return navigateTo('/dashboard')
  }
})