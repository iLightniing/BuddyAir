<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { usePaymentMethodsManager } from '~/composables/usePaymentMethodsManager'

const { 
  paymentMethods, showModal, form, showDeleteModal, itemToDelete, icons,
  init, updateOrder, openModal, save, requestDelete, confirmDelete 
} = usePaymentMethodsManager()

onMounted(init)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-black text-ui-content">Moyens de paiement</h2>
        <p class="text-sm text-ui-content-muted">Gérez vos modes de règlement.</p>
      </div>
      <UiButton @click="openModal()" variant="primary" class="shadow-sm">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Ajouter
      </UiButton>
    </div>

    <div class="bg-ui-surface border border-ui-border rounded-xl overflow-hidden">
      <VueDraggable 
        v-model="paymentMethods" 
        :animation="150" 
        handle=".drag-handle"
        @end="updateOrder"
        class="divide-y divide-ui-border"
      >
        <div v-for="item in paymentMethods" :key="item.id" class="p-4 flex items-center gap-4 group hover:bg-ui-surface-muted/50 transition-colors">
          <div class="drag-handle cursor-move text-ui-content-muted hover:text-ui-content p-1">
            <Icon name="lucide:grip-vertical" class="w-5 h-5" />
          </div>
          
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon :name="item.icon" class="w-5 h-5" />
          </div>

          <div class="flex-1">
            <div class="font-bold text-ui-content">{{ item.name }}</div>
            <div class="text-xs text-ui-content-muted font-mono opacity-70">{{ item.code }}</div>
          </div>

          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openModal(item)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 text-ui-content-muted hover:text-blue-600 transition-colors">
              <Icon name="lucide:pen-line" class="w-4 h-4" />
            </button>
            <button @click="requestDelete(item)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-ui-content-muted hover:text-red-600 transition-colors">
              <Icon name="lucide:trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </VueDraggable>
      
      <div v-if="paymentMethods.length === 0" class="p-8 text-center text-ui-content-muted">
        Aucun moyen de paiement configuré.
      </div>
    </div>

    <!-- Modal Édition -->
    <UiModal :show="showModal" @close="showModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-lg font-black text-ui-content mb-6">{{ form.id ? 'Modifier' : 'Nouveau moyen de paiement' }}</h3>
        
        <div class="space-y-4">
          <UiInput v-model="form.name" label="Nom" placeholder="Ex: PayPal" required />
          
          <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1 mb-2 block">Icône</label>
            <div class="grid grid-cols-6 gap-2">
              <button 
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
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <UiButton @click="showModal = false" variant="secondary">Annuler</UiButton>
          <UiButton @click="save">Enregistrer</UiButton>
        </div>
      </div>
    </UiModal>

    <!-- Modal Suppression -->
    <UiModal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:alert-triangle" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer ce moyen de paiement ?</h3>
        <p class="text-sm text-ui-content-muted mb-6">
          Cette action est irréversible. Les transactions existantes conserveront leur code historique.
        </p>
        <div class="flex justify-center gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="bg-red-600 hover:bg-red-700 text-white border-red-600">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>