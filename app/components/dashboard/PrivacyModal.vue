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
        <h3 class="text-xl font-black text-ui-content">Politique de Confidentialité</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-ui-surface-muted rounded-full transition-colors">
          <Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" />
        </button>
      </div>
      
      <div class="overflow-y-auto pr-2 space-y-4 text-sm text-ui-content-muted">
        <p><strong>Dernière mise à jour :</strong> {{ new Date().toLocaleDateString() }}</p>
        
        <h4 class="text-ui-content font-bold">1. Introduction</h4>
        <p>La protection de vos données personnelles est une priorité absolue pour BuddyAir. Cette politique détaille quelles données nous collectons et comment nous les protégeons.</p>

        <h4 class="text-ui-content font-bold">2. Données collectées</h4>
        <ul class="list-disc pl-5 space-y-1">
            <li><strong>Données d'identité :</strong> Nom, prénom, adresse email.</li>
            <li><strong>Données financières :</strong> Comptes, transactions, budgets et objectifs que vous saisissez manuellement ou importez.</li>
            <li><strong>Données de paiement :</strong> Gérées exclusivement par notre prestataire sécurisé Stripe. Nous ne stockons jamais vos numéros de carte bancaire complets.</li>
            <li><strong>Données techniques :</strong> Adresse IP, logs de connexion, type de navigateur (pour la sécurité et le débogage).</li>
        </ul>

        <h4 class="text-ui-content font-bold">3. Utilisation des données</h4>
        <p>Vos données sont traitées pour les finalités suivantes :</p>
        <ul class="list-disc pl-5 space-y-1">
            <li>Fourniture du service de gestion financière.</li>
            <li>Gestion de la facturation et des abonnements Premium.</li>
            <li>Amélioration de l'expérience utilisateur et correction de bugs.</li>
            <li>Envoi de notifications transactionnelles (confirmations, alertes de sécurité).</li>
        </ul>

        <h4 class="text-ui-content font-bold">4. Sécurité des données</h4>
        <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données : chiffrement des communications (HTTPS/TLS), hachage des mots de passe, et restrictions d'accès aux bases de données.</p>

        <h4 class="text-ui-content font-bold">5. Partage des données</h4>
        <p>Nous ne vendons jamais vos données personnelles. Elles peuvent être transmises à nos sous-traitants techniques (hébergement, paiement via Stripe) dans la stricte limite nécessaire au fonctionnement du service.</p>

        <h4 class="text-ui-content font-bold">6. Vos droits (RGPD)</h4>
        <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez exercer ces droits directement depuis votre espace profil ou en contactant le support.</p>
      </div>

      <div class="mt-6 pt-4 border-t border-ui-border flex justify-end shrink-0">
        <UiButton @click="$emit('close')">Fermer</UiButton>
      </div>
    </div>
  </UiModal>
</template>