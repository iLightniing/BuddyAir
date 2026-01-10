<script setup lang="ts">
import type { Database } from '~/types/database.types'

defineProps<{
  label: string
}>()

const supabase = useSupabaseClient<Database>()

const loginWithProvider = async (provider: 'google') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin + '/confirm'
    }
  })
  if (error) console.error('Erreur Auth Sociale:', error.message)
}
</script>

<template>
  <div class="mt-10">
    <div class="relative flex items-center mb-4">
      <div class="flex-grow border-t border-white/5"></div>
      <span class="mx-4 text-xs font-bold text-white uppercase tracking-[0.2em]">{{ label }}</span>
      <div class="flex-grow border-t border-white/5"></div>
    </div>
    
    <div class="flex flex-col gap-4">
      <button 
        type="button" 
        @click="loginWithProvider('google')"
        class="flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-white text-sm font-bold cursor-pointer group/btn w-full"
      >
        <Icon name="logos:google-icon" class="w-5 h-5" />
        Continuer avec Google
      </button>
    </div>
  </div>
</template>