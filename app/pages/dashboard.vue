<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const user = useSupabaseUser()
</script>

<template>
  <div class="space-y-10">
    <div v-if="user">
      <!-- Header -->
      <header>
        <p class="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Aperçu global</p>
        <h1 class="text-5xl font-black tracking-tighter text-white">
          Bonjour, <span class="bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">{{ user.user_metadata?.username || 'Aventurier' }}</span>
        </h1>
      </header>

      <!-- Empty State Card -->
      <div class="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-12 shadow-2xl">
        <!-- Top Right Button -->
        <div class="absolute top-8 right-8">
          <button class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold rounded-md transition-all cursor-pointer group">
            <Icon name="lucide:plus" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Ajouter un widget
          </button>
        </div>
        
        <!-- Content -->
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-white/10">
            <Icon name="lucide:layout-grid" class="w-10 h-10" />
          </div>
          <p class="text-white/50 text-xl font-medium italic">Aucun widget paramétré</p>
        </div>
      </div>
    </div>
  </div>
</template>