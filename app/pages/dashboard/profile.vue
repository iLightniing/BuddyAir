<script setup lang="ts">
definePageMeta({ title: 'Mon Profil' })

const pb = usePocketBase()
const { notify } = useNotification()
const user = usePocketBaseUser()
const loading = ref(false)
const isEditing = ref(false)
const originalForm = ref<any>(null)

// --- Gestion du Profil ---
const form = ref({
  sex: '',
  surname: '',
  firstname: '',
  birthdate: '',
  address: '',
  zipcode: '',
  city: '',
  country: '',
  phone: ''
})

const sexOptions = [
  { label: 'Homme', value: 'Homme' },
  { label: 'Femme', value: 'Femme' },
  { label: 'Autre', value: 'Autre' }
]

// Initialisation des données
onMounted(() => {
  if (user.value) {
    form.value = {
      sex: user.value.sex || '',
      surname: user.value.surname || '',
      firstname: user.value.firstname || '',
      birthdate: user.value.birthdate ? user.value.birthdate.split('T')[0] : '',
      address: user.value.address || '',
      zipcode: user.value.zipcode || '',
      city: user.value.city || '',
      country: user.value.country || '',
      phone: user.value.phone || ''
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const startEdit = () => {
  originalForm.value = { ...form.value }
  isEditing.value = true
}

const cancelEdit = () => {
  form.value = { ...originalForm.value }
  isEditing.value = false
}

const updateProfile = async () => {
  if (!user.value) return
  loading.value = true
  try {
    const data = {
      ...form.value,
      birthdate: form.value.birthdate ? new Date(form.value.birthdate).toISOString() : null
    }
    const updatedUser = await pb.collection('users').update(user.value.id, data)
    user.value = updatedUser // Mise à jour du state local
    isEditing.value = false
    notify("Profil mis à jour avec succès", "success")
  } catch (e: any) {
    notify("Erreur lors de la mise à jour", "error")
  } finally {
    loading.value = false
  }
}

// --- Adresse Autocomplete (API Gouv) ---
const addressSuggestions = ref<any[]>([])
const showSuggestions = ref(false)
const addressContainerRef = ref<HTMLElement | null>(null)

const onAddressInput = async (e: Event) => {
  const query = (e.target as HTMLInputElement).value
  if (query.length < 3) {
    addressSuggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`)
    const data = await res.json()
    addressSuggestions.value = data.features || []
    showSuggestions.value = true
  } catch (err) {
    console.error("Erreur API Adresse", err)
  }
}

const selectAddress = (feature: any) => {
  form.value.address = feature.properties.name
  form.value.zipcode = feature.properties.postcode
  form.value.city = feature.properties.city
  form.value.country = 'France'
  showSuggestions.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (addressContainerRef.value && !addressContainerRef.value.contains(event.target as Node)) {
    showSuggestions.value = false
  }
}

// --- Gestion du Mot de passe ---
const showPasswordModal = ref(false)
const pwdForm = ref({
  oldPassword: '',
  password: '',
  passwordConfirm: ''
})
const pwdLoading = ref(false)

const updatePassword = async () => {
  if (pwdForm.value.password !== pwdForm.value.passwordConfirm) {
    notify("Les nouveaux mots de passe ne correspondent pas", "error")
    return
  }
  if (!user.value) return

  pwdLoading.value = true
  try {
    await pb.collection('users').update(user.value.id, {
      oldPassword: pwdForm.value.oldPassword,
      password: pwdForm.value.password,
      passwordConfirm: pwdForm.value.passwordConfirm
    })
    notify("Mot de passe modifié avec succès", "success")
    showPasswordModal.value = false
    pwdForm.value = { oldPassword: '', password: '', passwordConfirm: '' }
  } catch (e: any) {
    notify("Erreur : Ancien mot de passe incorrect ou critères non respectés", "error")
  } finally {
    pwdLoading.value = false
  }
}
</script>

<template>
  <div class="w-full space-y-8">
    <!-- Informations Personnelles -->
    <div class="bg-ui-surface border border-ui-border rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-ui-content">Informations personnelles</h2>
        <div class="flex gap-3">
          <template v-if="isEditing">
            <UiButton @click="cancelEdit" variant="secondary" class="px-6">Annuler</UiButton>
            <UiButton @click="updateProfile" :disabled="loading" class="px-6">
              {{ loading ? '...' : 'Enregistrer' }}
            </UiButton>
          </template>
          <UiButton v-else @click="startEdit" variant="secondary" class="px-6">
            <Icon name="lucide:pencil" class="w-4 h-4 mr-2" /> Modifier
          </UiButton>
        </div>
      </div>

      <form @submit.prevent="updateProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <UiSelect v-model="form.sex" label="Sexe" :options="sexOptions" :disabled="!isEditing" />
           <UiDate v-model="form.birthdate" label="Date de naissance" :disabled="!isEditing" />
           <UiInput v-model="form.surname" label="Nom" placeholder="Votre nom" :disabled="!isEditing" />
           <UiInput v-model="form.firstname" label="Prénom" placeholder="Votre prénom" :disabled="!isEditing" />
           <UiInput v-model="form.phone" label="Téléphone" placeholder="06 12 34 56 78" :disabled="!isEditing" />
        </div>
        
        <div class="border-t border-ui-border pt-6">
           <h3 class="text-sm font-bold text-ui-content mb-4">Adresse</h3>
           <div class="space-y-4 relative" ref="addressContainerRef">
              <div class="relative">
                <UiInput 
                  v-model="form.address" 
                  label="Adresse" 
                  placeholder="Commencez à saisir votre adresse..." 
                  :disabled="!isEditing"
                  @input="onAddressInput"
                  autocomplete="off"
                />
                <!-- Suggestions Dropdown -->
                <div v-if="showSuggestions && addressSuggestions.length > 0 && isEditing" class="absolute top-full left-0 w-full bg-ui-surface border border-ui-border rounded-md shadow-lg z-50 mt-1 overflow-hidden">
                  <button 
                    v-for="suggestion in addressSuggestions" 
                    :key="suggestion.properties.id"
                    type="button"
                    @click="selectAddress(suggestion)"
                    class="w-full text-left px-4 py-3 text-sm hover:bg-ui-surface-muted transition-colors border-b border-ui-border last:border-0"
                  >
                    <div class="font-medium text-ui-content">{{ suggestion.properties.name }}</div>
                    <div class="text-xs text-ui-content-muted">{{ suggestion.properties.postcode }} {{ suggestion.properties.city }}</div>
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
      </form>
    </div>

    <!-- Sécurité -->
    <div class="bg-ui-surface border border-ui-border rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-bold text-ui-content mb-6">Connexion & Sécurité</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Adresse Email</label>
            <div class="mt-2 p-3 bg-ui-surface-muted border border-ui-border rounded-md text-ui-content-muted font-medium flex items-center justify-between cursor-not-allowed opacity-75">
               <div class="flex items-center gap-2">
                  <Icon name="lucide:lock" class="w-4 h-4" />
                  {{ user?.email }}
               </div>
            <span class="text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="lucide:badge-check" class="w-3.5 h-3.5" /> Vérifié
               </span>
            </div>
            <p class="text-xs text-ui-content-muted mt-1 ml-1">L'adresse email ne peut pas être modifiée pour des raisons de sécurité.</p>
         </div>

         <div>
            <label class="text-[10px] font-black text-ui-content-muted uppercase tracking-[0.2em] ml-1">Mot de passe</label>
            <div class="mt-2 w-full p-3 bg-ui-surface border border-ui-border rounded-md text-ui-content font-black tracking-widest flex items-center justify-between">
               <span>••••••••••••••••</span>
               <button @click="showPasswordModal = true" class="text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors">Modifier</button>
            </div>
         </div>
      </div>
    </div>

    <!-- Modal Mot de passe -->
    <UiModal :show="showPasswordModal">
       <div class="bg-ui-surface border border-ui-border p-6 rounded-xl shadow-2xl max-w-md w-full">
          <div class="flex items-center justify-between mb-6">
             <h3 class="text-xl font-black text-ui-content">Modifier le mot de passe</h3>
             <button @click="showPasswordModal = false"><Icon name="lucide:x" class="w-5 h-5 text-ui-content-muted" /></button>
          </div>
          <form @submit.prevent="updatePassword" class="space-y-4">
             <UiInput v-model="pwdForm.oldPassword" type="password" label="Ancien mot de passe" required />
             <UiInput v-model="pwdForm.password" type="password" label="Nouveau mot de passe" required />
             <UiInput v-model="pwdForm.passwordConfirm" type="password" label="Confirmer le nouveau mot de passe" required />
             
             <div class="pt-4 flex gap-3">
                <UiButton type="button" @click="showPasswordModal = false" variant="secondary" class="flex-1">Annuler</UiButton>
                <UiButton type="submit" :disabled="pwdLoading" class="flex-1">{{ pwdLoading ? '...' : 'Valider' }}</UiButton>
             </div>
          </form>
       </div>
    </UiModal>
  </div>
</template>