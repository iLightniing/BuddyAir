<script setup lang="ts">
defineProps<{
  form: any
  sexOptions: any[]
  isEditing: boolean
}>()
</script>

<template>
  <div class="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm">
     <div class="flex items-center gap-3 mb-6 pb-4 border-b border-ui-border">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
           <Icon name="lucide:user-circle" class="w-5 h-5" />
        </div>
        <div>
           <h2 class="text-lg font-bold text-ui-content">Informations personnelles</h2>
           <p class="text-xs text-ui-content-muted">Gérez vos informations d'identité.</p>
        </div>
     </div>

     <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <UiSelect v-model="form.sex" label="Civilité" :options="sexOptions" :disabled="!isEditing" />
           <UiDate v-model="form.birthdate" label="Date de naissance" :disabled="!isEditing" />
           <UiInput v-model="form.firstname" label="Prénom" placeholder="Votre prénom" :disabled="!isEditing" />
           <UiInput v-model="form.surname" label="Nom" placeholder="Votre nom" :disabled="!isEditing" />
           <div class="md:col-span-2">
              <UiInput v-model="form.phone" label="Téléphone" placeholder="06 12 34 56 78" :disabled="!isEditing" />
           </div>
        </div>
     </div>
  </div>
</template>