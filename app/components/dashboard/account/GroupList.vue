<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

interface Account {
  id: string;
  name: string;
  bank: string;
  account_group: 'current' | 'savings' | 'credit';
  current_balance: number;
  currency: string;
  interest_rate?: number;
  savings_type?: string;
  monthly_payment?: number;
  loan_start_date?: string;
  loan_duration?: number;
}

defineProps<{
  title: string
  icon: string
  isEditMode: boolean
}>()

const accounts = defineModel<Account[]>('accounts', { required: true })

const emit = defineEmits(['edit', 'delete', 'updateOrder', 'dragStart', 'dragEnd'])
</script>

<template>
  <div v-if="accounts.length > 0" class="space-y-3">
    <h3 class="text-sm font-black text-ui-content-muted uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon :name="icon" class="w-4 h-4" /> {{ title }}
    </h3>
    <VueDraggable 
      v-model="accounts"
      :animation="300"
      :disabled="!isEditMode"
      ghost-class="sortable-ghost"
      drag-class="sortable-drag"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      @start="emit('dragStart')"
      @end="emit('dragEnd'); emit('updateOrder')"
    >
      <div v-for="acc in accounts" :key="acc.id" class="h-full">
        <DashboardAccountCard 
          :account="acc" 
          :is-edit-mode="isEditMode"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </VueDraggable>
  </div>
</template>