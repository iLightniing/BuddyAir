<script setup lang="ts">
import { useProfileManager } from '~/composables/useProfileManager'
import { useAvatarManager } from '~/composables/useAvatarManager'
import { useAccountSecurity } from '~/composables/useAccountSecurity'
import { useUserPreferences } from '~/composables/useUserPreferences'

definePageMeta({ title: 'Mon Profil' })

const pb = usePocketBase()

// --- Data & State Management ---
const {
  user, loading, isEditing, form, sexOptions,
  startEdit, cancelEdit, updateProfile,
  addressSuggestions, showSuggestions, addressContainerRef, onAddressInput, selectAddress,
  showPasswordModal, pwdForm, pwdLoading, updatePassword
} = useProfileManager()

const {
  fileInput, avatarPreview, isUploadingAvatar,
  triggerFileInput, handleAvatarChange
} = useAvatarManager()

const {
  showDeleteConfirm, isDeleting, deleteAccount
} = useAccountSecurity()

const { preferences } = useUserPreferences()

// --- Computed Properties ---
const userInitials = computed(() => {
  const name = user.value?.name || ''
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'U'
})
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <DashboardProfileHeader 
      :user="user" 
      :loading="loading" 
      :is-editing="isEditing" 
      :user-initials="userInitials"
      @start-edit="startEdit"
      @cancel-edit="cancelEdit"
      @save="updateProfile"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <!-- Colonne Gauche : Infos -->
       <div class="lg:col-span-2 space-y-8">
          <form @submit.prevent="updateProfile" class="space-y-8">
            <DashboardProfileIdentityCard :form="form" :sex-options="sexOptions" :is-editing="isEditing" />
            
            <DashboardProfileAddressCard 
              :form="form" 
              :is-editing="isEditing" 
              :address-suggestions="addressSuggestions" 
              :show-suggestions="showSuggestions"
              @input-address="onAddressInput"
              @select-address="selectAddress"
              ref="addressContainerRef"
            />
          </form>
       </div>

       <!-- Colonne Droite : Sécurité -->
       <div class="space-y-8">
          <DashboardProfileSecurityCard :user="user" @edit-password="showPasswordModal = true" />

          <DashboardProfilePreferencesCard :preferences="preferences" />

          <DashboardProfileDangerZone @delete="showDeleteConfirm = true" />
       </div>
    </div>

    <DashboardProfileDeleteAccountModal 
      :show="showDeleteConfirm" 
      :user="user" 
      :loading="isDeleting" 
      @close="showDeleteConfirm = false" 
      @confirm="deleteAccount" 
    />

    <DashboardProfilePasswordModal 
      :show="showPasswordModal" 
      :form="pwdForm" 
      :loading="pwdLoading" 
      @close="showPasswordModal = false" 
      @submit="updatePassword" 
    />
  </div>
</template>