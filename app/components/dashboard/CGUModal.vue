<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between mb-6 shrink-0">
        <h3 class="text-xl font-black text-ui-content">Conditions Générales d'Utilisation</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-ui-surface-muted rounded-full transition-colors">
          <Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" />
        </button>
      </div>
      
      <div class="overflow-y-auto pr-2 space-y-4 text-sm text-ui-content-muted">
        <p><strong>Dernière mise à jour :</strong> {{ new Date().toLocaleDateString() }}</p>
        
        <h4 class="text-ui-content font-bold">1. Objet et Acceptation</h4>
        <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application BuddyAir. En créant un compte, vous acceptez sans réserve les présentes conditions.</p>

        <h4 class="text-ui-content font-bold">2. Description du Service</h4>
        <p>BuddyAir est un outil de gestion financière personnelle permettant de suivre ses comptes, budgets et transactions. Le service est fourni "tel quel" et ne constitue pas un conseil financier professionnel.</p>

        <h4 class="text-ui-content font-bold">3. Responsabilités de l'Utilisateur</h4>
        <p>Vous êtes responsable de la confidentialité de vos identifiants de connexion et de l'exactitude des données que vous saisissez. Tout usage frauduleux ou illégal du service pourra entraîner la suspension immédiate du compte.</p>

        <h4 class="text-ui-content font-bold">4. Abonnements et Paiements</h4>
        <p>Certaines fonctionnalités nécessitent un abonnement Premium. Les paiements sont sécurisés et gérés par Stripe. L'abonnement est sans engagement et peut être résilié à tout moment depuis l'espace utilisateur.</p>

        <h4 class="text-ui-content font-bold">5. Propriété Intellectuelle</h4>
        <p>L'application BuddyAir, son design, son code source et ses logos sont la propriété exclusive de l'éditeur. Vos données financières restent votre entière propriété.</p>

        <h4 class="text-ui-content font-bold">6. Limitation de Responsabilité</h4>
        <p>BuddyAir ne saurait être tenu responsable des pertes financières, erreurs de saisie ou indisponibilités temporaires du service. L'utilisateur reste seul maître de ses décisions financières.</p>

        <h4 class="text-ui-content font-bold">7. Modification et Résiliation</h4>
        <p>Nous nous réservons le droit de modifier les présentes CGU à tout moment. Vous pouvez supprimer votre compte et toutes vos données à tout moment via les paramètres de l'application.</p>
      </div>

      <div class="mt-6 pt-4 border-t border-ui-border flex justify-end shrink-0">
        <UiButton @click="$emit('close')">Fermer</UiButton>
      </div>
    </div>
  </UiModal>
</template>