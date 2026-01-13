<script setup lang="ts">
const route = useRoute()

const links = [
  { label: 'Accueil', to: '/dashboard', icon: 'lucide:layout-dashboard', exact: true },
  { label: 'Comptes', to: '/dashboard/accounts', icon: 'lucide:wallet' },
  { label: 'Budget', to: '/dashboard/budget', icon: 'lucide:pie-chart' },
  { label: 'Projets', to: '/dashboard/projects', icon: 'lucide:rocket' },
  { label: 'Analyses', to: '/dashboard/stats', icon: 'lucide:bar-chart-3' },
  { label: 'Profil', to: '/dashboard/profile', icon: 'lucide:user' },
  { label: 'Paramètres', to: '/dashboard/settings', icon: 'lucide:settings' },
]

const isLinkActive = (link: { to: string, exact?: boolean }) => {
  if (link.exact) return route.path === link.to
  return route.path.startsWith(link.to)
}
</script>

<template>
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ui-surface/90 backdrop-blur-xl border-t border-ui-border pb-safe">
    <div class="flex justify-around items-center h-16">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to" :class="['flex flex-col items-center justify-center w-full h-full gap-1 transition-colors', isLinkActive(link) ? 'text-blue-500' : 'text-ui-content-muted hover:text-ui-content']">
        <Icon :name="link.icon" class="w-6 h-6" />
        <span class="text-[10px] font-medium">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>