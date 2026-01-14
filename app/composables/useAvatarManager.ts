export const useAvatarManager = () => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()

  const fileInput = ref<HTMLInputElement | null>(null)
  const avatarPreview = ref<string | null>(null)
  const isUploadingAvatar = ref(false)

  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  const handleAvatarChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      avatarPreview.value = URL.createObjectURL(file)
      
      if (!user.value) return
      isUploadingAvatar.value = true
      try {
        const formData = new FormData()
        formData.append('avatar', file)
        await pb.collection('users').update(user.value.id, formData)
        await pb.collection('users').authRefresh()
        notify('Photo de profil mise à jour', 'success')
      } catch (e) {
        console.error(e)
        notify("Erreur lors de l'upload de la photo", 'error')
      } finally {
        isUploadingAvatar.value = false
      }
    }
  }

  return {
    fileInput,
    avatarPreview,
    isUploadingAvatar,
    triggerFileInput,
    handleAvatarChange,
  }
}