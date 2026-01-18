<script setup lang="ts">
import { useUsersManager } from '~/composables/useUsersManager'

const props = defineProps<{
  show: boolean
  user: any
}>()

const emit = defineEmits(['close', 'edit', 'delete', 'impersonate'])

const { getRoleLabel } = useUsersManager()

const subscriptionDetails = ref<any>(null)
const isLoadingSub = ref(false)

watch(() => props.user, async (newUser) => {
  subscriptionDetails.value = null
  if (props.show && newUser && newUser.role === 2 && newUser.stripe_customer_id) {
    isLoadingSub.value = true
    try {
      subscriptionDetails.value = await $fetch('/api/stripe/subscription', {
        query: { customerId: newUser.stripe_customer_id }
      })
    } catch (e) {
      console.error("Erreur fetch sub admin", e)
    } finally {
      isLoadingSub.value = false
    }
  }
}, { immediate: true })
</script>

<template>
  <UiModal :show="show" @close="$emit('close')">
    <div class="bg-ui-surface border border-ui-border rounded-xl shadow-2xl max-w-2xl w-full">
        <!-- Header -->
        <div class="bg-ui-surface-muted p-6 border-b border-ui-border flex items-start justify-between rounded-t-xl">
           <div class="flex items-center gap-5">
              <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black shadow-sm border-2 border-white overflow-hidden">
                 <img v-if="user?.avatar" :src="`http://127.0.0.1:8090/api/files/users/${user.id}/${user.avatar}`" class="w-full h-full object-cover" alt="Avatar" />
                 <span v-else>{{ user?.name?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
              <div>
                 <h3 class="text-xl font-black text-ui-content">{{ user?.name || 'Utilisateur' }}</h3>
                 <p class="text-sm text-ui-content-muted font-medium">{{ user?.email }}</p>
                 <div class="mt-2 flex gap-2 flex-wrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border" :class="user ? getRoleLabel(user.role).class.replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-') : ''">
                       {{ user ? getRoleLabel(user.role).label : '' }}
                    </span>
                    <span v-if="user?.verified" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                       <Icon name="lucide:badge-check" class="w-3 h-3 mr-1" /> Vérifié
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                       Non vérifié
                    </span>

                    <!-- Info Abonnement (Header) -->
                    <template v-if="user?.role === 2">
                        <span v-if="isLoadingSub" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">
                            <Icon name="lucide:loader-2" class="w-3 h-3 mr-1 animate-spin" /> ...
                        </span>
                        <span v-else-if="subscriptionDetails && subscriptionDetails.active" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                            :class="subscriptionDetails.cancel_at_period_end ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
                            <Icon :name="subscriptionDetails.cancel_at_period_end ? 'lucide:clock' : 'lucide:refresh-cw'" class="w-3 h-3 mr-1" />
                            {{ subscriptionDetails.cancel_at_period_end ? 'Fin : ' : 'Renouvellement : ' }} {{ new Date(subscriptionDetails.current_period_end).toLocaleDateString('fr-FR') }}
                        </span>
                        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Icon name="lucide:calendar" class="w-3 h-3 mr-1" />
                            Fin : {{ user.current_period_end ? new Date(user.current_period_end).toLocaleDateString('fr-FR') : 'N/A' }}
                        </span>
                    </template>
                 </div>
              </div>
           </div>
        </div>

        <div v-if="user" class="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
           <!-- Informations Personnelles -->
           <div>
              <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-ui-border">
                 <Icon name="lucide:user" class="w-4 h-4" /> Informations personnelles
              </h4>
              <div class="grid grid-cols-2 gap-y-6 gap-x-8">
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Prénom & Nom</p>
                    <p class="text-sm font-medium text-ui-content">{{ user.firstname || '-' }} {{ user.surname || '' }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Téléphone</p>
                    <p class="text-sm font-medium text-ui-content">{{ user.phone || '-' }}</p>
                 </div>
                 <div class="col-span-2">
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Adresse</p>
                    <p class="text-sm font-medium text-ui-content">
                       <span v-if="!user.address && !user.city">-</span>
                       <template v-else>
                         {{ user.address }}<br>
                         {{ user.zipcode }} {{ user.city }} <span v-if="user.country">({{ user.country }})</span>
                       </template>
                    </p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Date de naissance</p>
                    <p class="text-sm font-medium text-ui-content">{{ user.birthdate ? new Date(user.birthdate).toLocaleDateString('fr-FR') : '-' }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Sexe</p>
                    <p class="text-sm font-medium text-ui-content">{{ user.sex || '-' }}</p>
                 </div>
              </div>
           </div>

           <!-- Métadonnées -->
           <div>
              <h4 class="text-xs font-black text-ui-content-muted uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-ui-border">
                 <Icon name="lucide:database" class="w-4 h-4" /> Métadonnées
              </h4>
              <div class="grid grid-cols-2 gap-4 bg-ui-surface-muted/50 p-4 rounded-lg border border-ui-border">
                 <div class="col-span-2">
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">ID Utilisateur</p>
                    <p class="text-xs font-mono text-ui-content select-all bg-white border border-ui-border rounded px-2 py-1 inline-block">{{ user.id }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Créé le</p>
                    <p class="text-xs font-medium text-ui-content">{{ new Date(user.created).toLocaleString('fr-FR') }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] font-bold text-ui-content-muted uppercase mb-1">Dernière mise à jour</p>
                    <p class="text-xs font-medium text-ui-content">{{ new Date(user.updated).toLocaleString('fr-FR') }}</p>
                 </div>
              </div>
           </div>
        </div>
        
        <div class="bg-ui-surface-muted p-4 border-t border-ui-border flex justify-between items-center rounded-b-xl">
           <div class="relative group flex items-center">
               <UiButton @click="$emit('delete', user)" variant="ghost" class="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700">
                 <Icon name="lucide:trash-2" class="w-5 h-5" />
               </UiButton>
           </div>
           <div class="flex items-center gap-3">
             <UiButton @click="$emit('impersonate', user)" :disabled="!user.support_mode" class="h-9 w-9 p-0 !bg-indigo-600 text-white hover:!bg-indigo-700 shadow-indigo-500/20 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"><Icon :name="user.support_mode ? 'lucide:venetian-mask' : 'lucide:lock'" class="w-5 h-5" /></UiButton>
             <UiButton @click="$emit('edit', user)" class="h-9 w-9 p-0 !bg-red-600 text-white hover:!bg-red-700 shadow-red-500/20 shadow-lg"><Icon name="lucide:shield" class="w-5 h-5" /></UiButton>
             <UiButton @click="$emit('close')" class="h-9 w-9 p-0 bg-slate-800 text-white hover:bg-slate-900 border-slate-900 shadow-lg shadow-slate-900/20"><Icon name="lucide:x" class="w-5 h-5" /></UiButton>
           </div>
        </div>
      </div>
    </UiModal>
</template>