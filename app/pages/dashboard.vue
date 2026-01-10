<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const handleLogout = async () => {
  await supabase.auth.signOut()
  navigateTo('/auth/login')
}
</script>

<template>
  <div v-if="user" class="relative z-20 p-10 text-white">
    <div class="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-12 max-w-2xl">
      <h1 class="text-4xl font-black tracking-tighter mb-4">
        Tableau de <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">bord</span>
      </h1>
      <p class="text-lg text-white/70 mb-8 italic">Ravi de vous voir décoller, {{ user?.email }}</p>
      
      <UiButton @click="handleLogout" variant="secondary">
        Se déconnecter
      </UiButton>
    </div>
  </div>
</template>