<script setup lang="ts">
defineProps<{
  label: string
}>()

const emit = defineEmits(['error'])
const pb = usePocketBase()

const providers = [
  { name: 'google', icon: 'logos:google-icon', label: 'Continuer avec Google' }
]

const loginWithProvider = async (provider: string) => {
  try {
    await pb.collection('users').authWithOAuth2({ provider });
  } catch (error) {
    console.error('Erreur Auth Sociale:', error);
    emit('error', error)
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
        @click="loginWithProvider(provider.name)"
        class="flex items-center justify-center gap-3 py-3.5 bg-ui-surface border border-ui-border rounded-md hover:bg-ui-surface-muted transition-all text-ui-content text-sm font-bold cursor-pointer group/btn w-full"
      >
        <Icon :name="provider.icon" class="w-5 h-5" />
        {{ provider.label }}
      </button>
    </div>
  </div>
</template>