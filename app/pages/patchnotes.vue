<script setup lang="ts">
import SettingsPatchnotes from '~/components/settings/SettingsPatchnotes.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Nouveautés'
})
</script>

<template>
  <div class="space-y-12">
    <!-- Header -->
    <div class="flex flex-col items-center text-center py-8 space-y-4">
       <div class="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-2 shadow-sm">
          <Icon name="lucide:sparkles" class="w-8 h-8" />
       </div>
       <h1 class="text-4xl md:text-5xl font-black text-ui-content tracking-tight">
         Quoi de neuf sur <span class="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BuddyAir</span> ?
       </h1>
       <p class="text-lg text-ui-content-muted max-w-2xl mx-auto">
         Découvrez les dernières fonctionnalités, les améliorations et ce qui se prépare pour l'avenir de votre gestion financière.
       </p>
    </div>

    <!-- Contenu réutilisé -->
    <SettingsPatchnotes />
  </div>
</template>

<style>
.prose hr {
  margin-top: 2em;
  margin-bottom: 2em;
  border-color: var(--ui-border);
}
</style>