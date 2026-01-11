<script setup lang="ts">
definePageMeta({
  title: 'Aperçu global'
})

const user = useSupabaseUser()
</script>

<template>
  <div class="space-y-6">
    <div v-if="user" class="space-y-4">
      <!-- Barre d'actions supérieure -->
      <div class="flex justify-end">
        <button class="inline-flex items-center gap-2 px-4 py-2 bg-ui-surface hover:bg-ui-surface-muted border border-ui-border text-ui-content text-xs font-bold rounded-md transition-all shadow-sm cursor-pointer group">
          <Icon name="lucide:plus" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 text-blue-500" />
          Ajouter un widget
        </button>
      </div>

      <!-- Empty State Card -->
      <div class="relative bg-ui-surface border border-ui-border rounded-md p-12 shadow-sm">
        <!-- Content -->
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-20 h-20 bg-ui-surface-muted rounded-3xl flex items-center justify-center mb-6 text-ui-content-muted/20">
            <Icon name="lucide:layout-grid" class="w-10 h-10" />
          </div>
          <p class="text-ui-content-muted text-xl font-medium italic">Aucun widget paramétré</p>
        </div>
      </div>
    </div>
  </div>
</template>