<script setup lang="ts">
defineProps<{
  preferences: any
}>()
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm h-fit">
     <div class="flex items-center gap-3 mb-6 pb-4 border-b border-ui-border">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
           <Icon name="lucide:settings-2" class="w-5 h-5" />
        </div>
        <div>
           <h2 class="text-lg font-bold text-ui-content">Préférences</h2>
           <p class="text-xs text-ui-content-muted">Personnalisez votre expérience.</p>
        </div>
     </div>
     <div class="space-y-4">
        <UiSwitch v-model="preferences.newsletter" label="S'abonner à la newsletter" description="Recevoir les actualités et mises à jour de BuddyAir." />
     </div>
  </div>
</template>