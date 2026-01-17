<script setup lang="ts">
import { useDashboardRefresh } from '~/composables/useDashboardRefresh'

const user = usePocketBaseUser()
const { refresh } = useDashboardRefresh()
</script>

<template>
  <ClientOnly>
    <button 
      v-if="user?.role === 3"
      @click="refresh"
      class="p-2 hover:bg-ui-surface-muted rounded-lg text-ui-content-muted hover:text-blue-600 transition-all group"
      title="Rafraîchir le contenu"
    >
      <Icon name="lucide:refresh-cw" class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
    </button>
  </ClientOnly>
</template>