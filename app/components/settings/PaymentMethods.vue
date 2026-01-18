<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { usePaymentMethodsManager } from '~/composables/usePaymentMethodsManager'
import PaymentMethodCard from './PaymentMethodCard.vue'

const { 
  paymentMethods, showModal, form, showDeleteModal, itemToDelete, icons,
  init, updateOrder, openModal, save, requestDelete, confirmDelete 
} = usePaymentMethodsManager(false)

onMounted(init)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-black text-ui-content">Moyens de paiement</h2>
        <p class="text-sm text-ui-content-muted">Gérez vos modes de règlement. Les modes avec <Icon name="lucide:lock" class="w-3 h-3 inline" /> sont gérés par l'administrateur.</p>
      </div>
      <UiButton @click="openModal()" variant="primary" class="shadow-sm">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Ajouter
      </UiButton>
    </div>

    <div v-if="paymentMethods.length > 0" class="bg-ui-surface border border-ui-border rounded-xl shadow-sm overflow-hidden">
    <VueDraggable 
      v-model="paymentMethods" 
      :animation="300" 
      handle=".drag-handle"
      @end="updateOrder"
      class="flex flex-col"
    >
      <PaymentMethodCard 
          v-for="item in paymentMethods" 
          :key="item.id" 
          :method="item" 
          @edit="openModal"
          @delete="requestDelete"
      />
    </VueDraggable>
    </div>
    
    <div v-if="paymentMethods.length === 0" class="p-12 text-center text-ui-content-muted border border-dashed border-ui-border rounded-xl">
      Aucun moyen de paiement configuré.
    </div>

    <!-- Modal Édition/Création -->
    <UiModal :show="showModal" @close="showModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-lg font-black text-ui-content mb-6">{{ form.id ? 'Modifier' : 'Nouveau moyen de paiement' }}</h3>
        
        <form @submit.prevent="save" class="space-y-4">
          <UiInput v-model="form.name" label="Nom" placeholder="Ex: PayPal" required autofocus />
          
          <UiSelect 
            v-model="form.type" 
            label="Type de transaction" 
            :options="[
              { label: 'Tout (Débit & Crédit)', value: 'both' },
              { label: 'Débit (Dépense)', value: 'debit' },
              { label: 'Crédit (Revenu)', value: 'credit' }
            ]" 
          />

          <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1 mb-2 block">Icône</label>
            <div class="grid grid-cols-6 gap-2">
              <button 
                type="button"
                v-for="icon in icons" 
                :key="icon"
                @click="form.icon = icon"
                class="w-10 h-10 rounded-lg flex items-center justify-center transition-all border"
                :class="form.icon === icon ? 'bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500' : 'bg-ui-surface border-ui-border hover:border-blue-300 text-ui-content-muted'"
              >
                <Icon :name="icon" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="mt-8 flex justify-end gap-3 pt-4">
            <UiButton type="button" @click="showModal = false" variant="secondary">Annuler</UiButton>
            <UiButton type="submit">Enregistrer</UiButton>
          </div>
        </form>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:triangle-alert" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer ce moyen de paiement ?</h3>
        <p class="text-sm text-ui-content-muted mb-6">
          Cette action est irréversible. Les transactions existantes conserveront leur code historique.
        </p>
        <div class="flex justify-center gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>