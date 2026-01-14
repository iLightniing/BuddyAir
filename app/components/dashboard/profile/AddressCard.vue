<script setup lang="ts">
const props = defineProps<{
  form: any
  isEditing: boolean
  addressSuggestions: any[]
  showSuggestions: boolean
}>()

const emit = defineEmits(['inputAddress', 'selectAddress'])
const addressContainerRef = ref(null)

defineExpose({ addressContainerRef })
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm">
     <div class="flex items-center gap-3 mb-6 pb-4 border-b border-ui-border">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
           <Icon name="lucide:map-pin" class="w-5 h-5" />
        </div>
        <div>
           <h2 class="text-lg font-bold text-ui-content">Coordonnées</h2>
           <p class="text-xs text-ui-content-muted">Votre adresse de facturation.</p>
        </div>
     </div>

     <div class="space-y-6 relative" ref="addressContainerRef">
        <div class="relative">
          <UiInput 
            v-model="form.address" 
            label="Adresse postale" 
            placeholder="Rechercher une adresse..." 
            :disabled="!isEditing"
            @input="emit('inputAddress', $event)"
            autocomplete="off"
          />
          <div v-if="showSuggestions && addressSuggestions.length > 0 && isEditing" class="absolute top-full left-0 w-full bg-ui-surface border border-ui-border rounded-xl shadow-xl z-50 mt-2 overflow-hidden">
            <button 
              v-for="suggestion in addressSuggestions" 
              :key="suggestion.properties.id"
              type="button"
              @click="emit('selectAddress', suggestion)"
              class="w-full text-left px-4 py-3 text-sm hover:bg-ui-surface-muted transition-colors border-b border-ui-border last:border-0 flex items-center gap-3"
            >
              <Icon name="lucide:map-pin" class="w-4 h-4 text-ui-content-muted shrink-0" />
              <div>
                 <div class="font-bold text-ui-content">{{ suggestion.properties.name }}</div>
                 <div class="text-xs text-ui-content-muted">{{ suggestion.properties.postcode }} {{ suggestion.properties.city }}</div>
              </div>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
           <UiInput v-model="form.zipcode" label="Code postal" :disabled="!isEditing" />
           <UiInput v-model="form.city" label="Ville" :disabled="!isEditing" />
           <UiInput v-model="form.country" label="Pays" :disabled="!isEditing" />
        </div>
     </div>
  </div>
</template>