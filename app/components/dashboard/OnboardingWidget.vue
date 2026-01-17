<script setup lang="ts">
const emit = defineEmits(['action'])

const steps = [
  {
    title: 'Créer un compte',
    description: 'Commencez par ajouter un compte bancaire ou une caisse.',
    icon: 'lucide:wallet',
    action: 'create-account',
    completed: false
  },
  {
    title: 'Ajouter une transaction',
    description: 'Enregistrez votre première dépense ou revenu.',
    icon: 'lucide:plus-circle',
    action: 'create-transaction',
    completed: false
  },
  {
    title: 'Définir un budget',
    description: 'Fixez des limites pour mieux gérer vos finances.',
    icon: 'lucide:pie-chart',
    action: 'create-budget',
    completed: false
  }
]
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm">
    <div class="mb-6">
      <h3 class="text-xl font-bold text-ui-content mb-2">Bienvenue à bord ! 🚀</h3>
      <p class="text-ui-content-muted">Voici quelques étapes pour bien démarrer avec BuddyAir.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="relative group cursor-pointer"
        @click="emit('action', step.action)"
      >
        <div class="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 rounded-xl transform transition-transform group-hover:scale-105 duration-300"></div>
        <div class="relative p-5 border border-ui-border rounded-xl bg-ui-surface h-full flex flex-col items-center text-center transition-colors group-hover:border-blue-400/30">
          <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <Icon :name="step.icon" class="w-6 h-6" />
          </div>
          <h4 class="font-semibold text-ui-content mb-2">{{ step.title }}</h4>
          <p class="text-sm text-ui-content-muted">{{ step.description }}</p>
          
          <div class="mt-4 text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
            Commencer &rarr;
          </div>
        </div>
      </div>
    </div>
  </div>
</template>