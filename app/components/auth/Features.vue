<script setup lang="ts">
const features = [
  {
    icon: 'lucide:target',
    color: 'text-blue-400',
    label: 'Maîtrisez vos dépenses :',
    subLabel: 'Suivez où va votre argent.'
  },
  {
    icon: 'lucide:calendar-range',
    color: 'text-pink-400',
    label: 'Planifiez',
    subLabel: 'vos dépenses récurrentes.'
  },
  {
    icon: 'lucide:layers',
    color: 'text-blue-400',
    label: 'Vos comptes',
    subLabel: 'réunis en une seule app.'
  },
  {
    icon: 'lucide:zap',
    color: 'text-pink-400',
    label: 'Améliorez',
    subLabel: "votre pouvoir d'achat."
  }
]
</script>

<template>
  <div class="space-y-8">
    <div v-for="(feature, i) in features" :key="i" class="flex items-center gap-5 group">
      <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-ui-surface border border-ui-border shadow-sm group-hover:bg-ui-surface-muted transition-colors duration-300">
        <Icon :name="feature.icon" class="w-6 h-6" :class="feature.color" />
      </div>
      <p class="text-ui-content font-bold text-lg">
        {{ feature.label }} <span class="text-ui-content-muted font-medium">{{ feature.subLabel }}</span>
      </p>
    </div>
  </div>
</template>