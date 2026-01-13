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
    } catch (e) {
      console.error("Erreur refresh auth:", e)
    }
  }
  checkAndGenerate()
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>