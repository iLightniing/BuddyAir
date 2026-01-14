<script setup lang="ts">
defineProps<{
  user: any
}>()

const emit = defineEmits(['editPassword'])
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm h-fit">
     <div class="flex items-center gap-3 mb-6 pb-4 border-b border-ui-border">
        <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
           <Icon name="lucide:lock" class="w-5 h-5" />
        </div>
        <div>
           <h2 class="text-lg font-bold text-ui-content">Sécurité</h2>
           <p class="text-xs text-ui-content-muted">Paramètres de connexion.</p>
        </div>
     </div>

     <div class="space-y-6">
        <div>
           <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Email</label>
           <div class="mt-2 p-3 bg-ui-surface-muted border border-ui-border rounded-xl text-ui-content font-medium flex items-center gap-3">
              <Icon name="lucide:mail" class="w-4 h-4 text-ui-content-muted" />
              <span class="truncate">{{ user?.email }}</span>
           </div>
        </div>

        <div>
           <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Mot de passe</label>
           <div class="mt-2 p-1 bg-ui-surface-muted border border-ui-border rounded-xl flex items-center justify-between pl-4">
              <span class="text-ui-content-muted tracking-widest text-sm">••••••••••••</span>
              <button @click="emit('editPassword')" class="text-xs font-bold bg-white hover:bg-gray-50 text-ui-content border border-ui-border shadow-sm px-3 py-2 rounded-lg transition-all">
                 Modifier
              </button>
           </div>
        </div>
     </div>
  </div>
</template>