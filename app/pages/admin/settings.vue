<script setup lang="ts">
import { useMaintenanceManager } from '~/composables/useMaintenanceManager'
import UiDate from '~/components/ui/Date.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Configuration Système',
  middleware: ['admin']
})

const {
  settings, loading, localStart, localEnd, isScheduled, isExpired, canSchedule,
  save, scheduleMaintenance, cancelMaintenance, init
} = useMaintenanceManager()

onMounted(init)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UiBackButton to="/admin" />
      <div>
          <h1 class="text-2xl font-black text-ui-content tracking-tight">Configuration Système</h1>
          <p class="text-sm text-ui-content-muted">Paramètres globaux de l'application.</p>
      </div>
    </div>

    <div v-if="loading && !settings.id" class="p-12 flex justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
    </div>

    <div v-else class="grid gap-6 max-w-2xl">
      <!-- Maintenance -->
      <div 
        class="bg-ui-surface border border-ui-border rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md animate-in zoom-in-95 duration-300"
        :class="isScheduled ? 'bg-orange-50 border-orange-200 shadow-lg shadow-orange-100' : (isExpired ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-ui-surface border-ui-border')"
      >
        <!-- Status Header -->
        <div class="px-6 py-4 flex items-center justify-between rounded-t-2xl" 
             :class="isScheduled ? 'bg-orange-50 border-b border-orange-100' : (isExpired ? 'bg-slate-100 border-b border-slate-200' : 'bg-white border-b border-ui-border')">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" 
                     :class="isScheduled ? 'bg-orange-100 text-orange-600' : (isExpired ? 'bg-slate-200 text-slate-500' : 'bg-slate-50 text-slate-400')">
                    <Icon name="lucide:construction" class="w-6 h-6" :class="{'animate-pulse': isScheduled}" />
                </div>
                <div>
                    <h3 class="text-sm font-black uppercase tracking-wider" 
                        :class="isScheduled ? 'text-orange-800' : (isExpired ? 'text-slate-700' : 'text-slate-500')">
                        {{ isExpired ? 'Maintenance Terminée' : (isScheduled ? 'Maintenance Active' : 'Mode Maintenance') }}
                    </h3>
                    <p class="text-xs font-medium" 
                       :class="isScheduled ? 'text-orange-600' : 'text-slate-400'">
                        {{ isScheduled ? 'Les utilisateurs sont redirigés.' : 'Le site est accessible.' }}
                    </p>
                </div>
            </div>
            
            <!-- Badge Statut -->
            <div v-if="isScheduled" class="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-orange-100 shadow-sm">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span class="text-[10px] font-black text-orange-600 uppercase tracking-widest">En cours</span>
            </div>
        </div>

        <!-- Configuration Body -->
        <div class="p-6 space-y-6 bg-ui-surface">
            <!-- Dates Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="space-y-1">
                    <UiDate v-model="localStart" label="Début de l'intervention" enable-time :disabled="isScheduled" />
                </div>
                <div class="space-y-1">
                    <UiDate v-model="localEnd" label="Fin estimée" enable-time :disabled="isScheduled" />
                </div>
            </div>

            <!-- Message -->
            <div class="space-y-2">
                <div class="flex justify-between items-end">
                    <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-widest ml-1">Message public</label>
                    <span class="text-[10px] text-ui-content-muted/60" v-if="!isScheduled">Visible sur la page de maintenance</span>
                </div>
                <div class="relative group">
                    <textarea 
                        v-model="settings.maintenance_message" 
                        rows="2" 
                        class="w-full bg-white border border-ui-border rounded-xl px-4 py-3 text-sm text-ui-content placeholder:text-ui-content-muted/40 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                        :class="{'opacity-60 bg-slate-50': isExpired}"
                        placeholder="Ex: Nous effectuons une mise à jour critique. Le service sera rétabli dans quelques minutes."
                        :disabled="isExpired"
                    ></textarea>
                    <div class="absolute bottom-3 right-3 text-ui-content-muted/20 pointer-events-none">
                        <Icon name="lucide:message-square" class="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions Footer -->
        <div class="px-6 py-4 bg-ui-surface-muted border-t border-ui-border flex items-center justify-between rounded-b-2xl">
            <div class="text-xs text-ui-content-muted font-medium">
                <span v-if="isScheduled">Fin prévue : {{ new Date(settings.maintenance_end).toLocaleString() }}</span>
                <span v-else>Configurez les dates pour activer.</span>
            </div>

            <div class="flex gap-3">
            <template v-if="isScheduled">
                 <UiButton @click="save" class="bg-orange-600 text-white hover:bg-orange-700 border-orange-700 shadow-sm">
                    Mettre à jour le message
                </UiButton>
                <UiButton @click="cancelMaintenance" class="bg-red-600 text-white hover:bg-red-700 border-red-700 shadow-sm">
                    Désactiver
                </UiButton>
            </template>
            
            <template v-else-if="isExpired">
                 <UiButton @click="cancelMaintenance" variant="secondary">
                    Réinitialiser
                </UiButton>
            </template>

            <template v-else>
                <UiButton 
                    @click="scheduleMaintenance" 
                    :disabled="!canSchedule" 
                    class="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none"
                >
                    <Icon name="lucide:calendar-clock" class="w-4 h-4 mr-2" />
                    Programmer
                </UiButton>
            </template>
            </div>
        </div>
      </div>

      <!-- Inscriptions -->
      <div class="bg-ui-surface border border-ui-border rounded-xl p-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Icon name="lucide:user-plus" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-ui-content">Inscriptions</h3>
              <p class="text-sm text-ui-content-muted">Autoriser les nouveaux utilisateurs à créer un compte.</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.allow_registrations" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
      </div>

      <div class="flex justify-end" v-if="!isScheduled">
        <UiButton @click="save" :loading="loading" class="px-8">Enregistrer les modifications</UiButton>
      </div>
    </div>
  </div>
</template>