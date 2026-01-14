export const useProfileManager = () => {
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

  const initForm = () => {
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
  }

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

  onMounted(() => {
    initForm()
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside)
    }
  })

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside)
    }
  })

  return {
    user, loading, isEditing, form, sexOptions,
    startEdit, cancelEdit, updateProfile,
    addressSuggestions, showSuggestions, addressContainerRef, onAddressInput, selectAddress,
    showPasswordModal, pwdForm, pwdLoading, updatePassword
  }
}