<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { usePaymentMethodsManager } from '~/composables/usePaymentMethodsManager'
import PaymentMethodCard from '~/components/settings/PaymentMethodCard.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Gestion des Modes de Paiement Globaux',
  middleware: ['admin']
})

const {
  paymentMethods, showModal, form, showDeleteModal, itemToDelete, icons,
  init, updateOrder, openModal, save, handleSaveMethod, requestDelete, confirmDelete
} = usePaymentMethodsManager(true)

onMounted(init)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UiBackButton to="/admin" />
        <div>
            <h1 class="text-2xl font-black text-ui-content tracking-tight">Modes de Paiement Globaux</h1>
            <p class="text-sm text-ui-content-muted">Ces modes de paiement seront disponibles pour tous les utilisateurs.</p>
        </div>
      </div>
      <UiButton @click="openModal()" class="shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" /> Nouveau mode
      </UiButton>
    </div>

    <!-- Liste -->
    <VueDraggable 
      v-model="paymentMethods" 
      :animation="300" 
      handle=".drag-handle"
      @end="updateOrder"
      class="flex flex-col gap-3"
    >
        <PaymentMethodCard 
            v-for="item in paymentMethods" 
            :key="item.id" 
            :method="item" 
            :is-admin="true"
            @save="handleSaveMethod"
            @delete="requestDelete"
        />
    </VueDraggable>

    <div v-if="paymentMethods.length === 0" class="p-12 text-center text-ui-content-muted border border-dashed border-ui-border rounded-xl">
        Aucun mode de paiement global configuré.
    </div>

    <!-- Modal Édition/Création -->
    <UiModal :show="showModal" @close="showModal = false">
      <div class="bg-ui-surface border border-ui-border p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-lg font-black text-ui-content mb-6">{{ form.id ? 'Modifier' : 'Nouveau mode de paiement' }}</h3>
        
        <form @submit.prevent="save" class="space-y-4">
          <UiInput v-model="form.name" label="Nom" placeholder="Ex: Carte Bancaire" required autofocus />
          
          <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1 mb-2 block">Icône</label>
            <div class="grid grid-cols-6 gap-2">
              <button 
                type="button"
                v-for="icon in icons" 
                :key="icon"
                @click="form.icon = icon"
                class="w-10 h-10 rounded-lg flex items-center justify-center transition-all border"
                :class="form.icon === icon ? 'bg-emerald-50 border-emerald-500 text-emerald-600 ring-1 ring-emerald-500' : 'bg-ui-surface border-ui-border hover:border-emerald-300 text-ui-content-muted'"
              >
                <Icon :name="icon" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="mt-8 flex justify-end gap-3 pt-4">
            <UiButton type="button" @click="showModal = false" variant="secondary">Annuler</UiButton>
            <UiButton type="submit" class="bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white">Enregistrer</UiButton>
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
        <h3 class="text-lg font-bold text-ui-content mb-2">Supprimer ce mode ?</h3>
        <p class="text-sm text-ui-content-muted mb-6">
          Si vous supprimez <span class="font-bold text-ui-content">{{ itemToDelete?.name }}</span>, il ne sera plus proposé par défaut. Les utilisateurs l'ayant déjà utilisé conserveront leur copie locale.
        </p>
        <div class="flex justify-center gap-3">
          <UiButton @click="showDeleteModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
          <UiButton @click="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600">Supprimer</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>