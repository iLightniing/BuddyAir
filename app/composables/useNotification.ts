export const useNotification = () => {
  const message = useState<string | null>('notification-message', () => null)
  const type = useState<'success' | 'error' | 'info'>('notification-type', () => 'info')
  const isVisible = useState<boolean>('notification-visible', () => false)

  const notify = (msg: string, notificationType: 'success' | 'error' | 'info' = 'info') => {
    message.value = msg
    type.value = notificationType
    isVisible.value = true

    setTimeout(() => {
      isVisible.value = false
    }, 5000)
  }

  return {
    message,
    type,
    isVisible,
    notify
  }
}