<script setup lang="ts">
defineProps<{
  label: string
}>()

const emit = defineEmits(['error'])
const { loginWithGoogle, loading } = useSocialAuth()

const providers = [
  { name: 'google', icon: 'logos:google-icon', label: 'Continuer avec Google' }
]

const loginWithProvider = async (provider: string) => {
  if (provider === 'google') {
    await loginWithGoogle()
  }
}
</script>

<template>
  <div class="mt-10">
    <div class="relative flex items-center mb-4">
      <div class="flex-grow border-t border-ui-border"></div>
      <span class="mx-4 text-xs font-bold text-ui-content-muted uppercase tracking-[0.2em]">{{ label }}</span>
      <div class="flex-grow border-t border-ui-border"></div>
    </div>
    
    <div class="flex flex-col gap-4">
      <button
        v-for="provider in providers"
        :key="provider.name" 
        type="button" 
        :disabled="loading"
        @click="loginWithProvider(provider.name)"
        class="flex items-center justify-center gap-3 py-3.5 bg-ui-surface border border-ui-border rounded-md hover:bg-ui-surface-muted transition-all text-ui-content text-sm font-bold cursor-pointer group/btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon v-if="loading && provider.name === 'google'" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
        <Icon v-else :name="provider.icon" class="w-5 h-5" />
        {{ provider.label }}
      </button>
    </div>
  </div>
</template>