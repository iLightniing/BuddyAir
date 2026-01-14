<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-black text-ui-content">À propos</h2>
      <p class="text-sm text-ui-content-muted">Informations sur l'application.</p>
    </div>

    <div class="bg-ui-surface border border-ui-border rounded-xl p-8 text-center shadow-sm">
      <div class="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
        <span class="text-3xl font-black text-white italic">BA</span>
      </div>
      <h3 class="text-2xl font-black text-ui-content mb-2">BuddyAir</h3>
      <p class="text-sm text-ui-content-muted font-medium mb-6">Version 1.0.0 (Bêta)</p>
      
      <div class="flex justify-center gap-4 text-xs font-bold text-ui-content-muted">
        <a href="#" class="hover:text-blue-600 transition-colors">Conditions d'utilisation</a>
        <span>•</span>
        <a href="#" class="hover:text-blue-600 transition-colors">Politique de confidentialité</a>
        <span>•</span>
        <a href="#" class="hover:text-blue-600 transition-colors">Support</a>
      </div>

      <div class="mt-8 pt-8 border-t border-ui-border text-[10px] text-ui-content-muted uppercase tracking-widest">
        Fait avec <Icon name="lucide:heart" class="w-3 h-3 inline text-red-500 mx-1" /> par votre équipe préférée
      </div>
    </div>
  </div>
</template>