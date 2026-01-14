<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const pb = usePocketBase()
const user = usePocketBaseUser()
const { checkAndGenerate } = useScheduleGenerator()

onMounted(async () => {
  // Rafraîchir les données utilisateur (rôle, etc.) au chargement du dashboard
  if (pb.authStore.isValid) {
    try {
      await pb.collection('users').authRefresh()
      user.value = pb.authStore.model
      // On ne génère les échéances que si l'auth est validée
      checkAndGenerate()
    } catch (e) {
      console.error("Erreur refresh auth:", e)
      // Si le refresh échoue (token invalide/expiré), on nettoie et on redirige
      pb.authStore.clear()
      user.value = null
      navigateTo('/auth/login')
    }
  }
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>