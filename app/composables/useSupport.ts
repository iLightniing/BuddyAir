import { ref, computed } from 'vue'

export const useSupport = (isAdmin = false) => {
  const pb = usePocketBase()
  const user = usePocketBaseUser()
  const { notify } = useNotification()

  const tickets = ref<any[]>([])
  const activeTicket = ref<any>(null)
  const messages = ref<any[]>([])
  const loading = ref(false)
  const loadingMessages = ref(false)
  const sending = ref(false)

  // --- Tickets ---

  const fetchTickets = async (background = false) => {
    if (!background) loading.value = true
    try {
      let filter = isAdmin ? '' : `user = "${user.value?.id}"`
      
      // Côté admin, on peut vouloir filtrer par statut par défaut, mais prenons tout pour l'instant
      const result = await pb.collection('tickets').getFullList({
        filter,
        sort: '-last_message_at,-created',
        expand: 'user'
      })
      tickets.value = result
    } catch (e) {
      console.error(e)
    } finally {
      if (!background) loading.value = false
    }
  }

  const createTicket = async (data: { subject: string, category: string, content: string }, files: File[] = []) => {
    if (!user.value) return null
    
    sending.value = true
    try {
      // 1. Créer le ticket
      const ticket = await pb.collection('tickets').create({
        user: user.value.id,
        subject: data.subject,
        category: data.category,
        status: 'open',
        last_message_at: new Date().toISOString(),
        is_read_by_user: true,
        is_read_by_admin: false
      })

      // 2. Créer le premier message
      const formData = new FormData()
      formData.append('ticket', ticket.id)
      formData.append('sender', user.value.id)
      formData.append('content', data.content)
      
      files.forEach(file => {
          formData.append('attachments', file)
      })

      await pb.collection('ticket_messages').create(formData)

      notify('Ticket créé avec succès', 'success')
      // On recharge la liste en arrière-plan
      fetchTickets(true)
      return ticket
    } catch (e) {
      console.error("Erreur création ticket:", e)
      notify('Erreur lors de la création du ticket', 'error')
      return null
    } finally {
      sending.value = false
    }
  }

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await pb.collection('tickets').update(ticketId, { status })
      notify(`Statut mis à jour : ${status}`, 'success')
      // Mise à jour locale
      const t = tickets.value.find(t => t.id === ticketId)
      if (t) t.status = status
      if (activeTicket.value?.id === ticketId) activeTicket.value.status = status
    } catch (e) {
      notify('Erreur lors de la mise à jour', 'error')
    }
  }

  // --- Messages ---

  const fetchMessages = async (ticketId: string) => {
    if (!ticketId) return
    loadingMessages.value = true
    messages.value = []
    
    // On se désabonne de tout pour éviter les conflits
    await pb.collection('ticket_messages').unsubscribe()

    try {
      const result = await pb.collection('ticket_messages').getFullList({
        filter: `ticket = "${ticketId}"`,
        sort: '+created',
        expand: 'sender'
      })
      messages.value = result
      
      // Abonnement Realtime pour ce ticket
      pb.collection('ticket_messages').subscribe('*', (e) => {
          if (e.record.ticket === ticketId && e.action === 'create') {
              // On ajoute le message si on ne l'a pas déjà (évite doublon si on est l'expéditeur)
              if (!messages.value.find(m => m.id === e.record.id)) {
                  // Petit hack pour expand le sender si c'est pas nous
                  if (e.record.sender !== user.value?.id) {
                      // Idéalement on fetch le sender, ici on simplifie
                      fetchMessages(ticketId) 
                  } else {
                      messages.value.push({ ...e.record, expand: { sender: user.value } })
                  }
              }
          }
      })

    } catch (e) {
      console.error(e)
    } finally {
      loadingMessages.value = false
    }
  }

  const sendMessage = async (ticketId: string, content: string, files: File[] = []) => {
    if (!user.value) return

    // Si on envoie une image sans texte, on met un texte par défaut pour passer la validation BDD
    let finalContent = content.trim()
    if (!finalContent && files.length > 0) {
        finalContent = "(Pièce jointe)"
    }

    if (!finalContent && files.length === 0) return

    sending.value = true
    try {
      const formData = new FormData()
      formData.append('ticket', ticketId)
      formData.append('sender', user.value!.id)
      formData.append('content', finalContent)
      
      files.forEach(file => {
          formData.append('attachments', file)
      })

      await pb.collection('ticket_messages').create(formData)
      
      // Mettre à jour la date du dernier message du ticket
      // On met dans un try/catch séparé pour ne pas bloquer l'envoi si les champs "is_read" n'existent pas
      try {
          await pb.collection('tickets').update(ticketId, { 
              last_message_at: new Date().toISOString(),
              status: isAdmin ? 'pending' : 'open',
              is_read_by_user: isAdmin ? false : true,
              is_read_by_admin: isAdmin ? true : false
          })
      } catch (err) {
          console.warn("Impossible de mettre à jour le statut du ticket (Vérifiez les champs is_read_... dans la BDD)", err)
      }

      // Refresh list to update order and status (background)
      fetchTickets(true)

      // Le message sera ajouté via le realtime ou on peut l'ajouter manuellement ici pour l'UX immédiate
      // fetchMessages(ticketId) // Pas nécessaire grâce au realtime
    } catch (e) {
      console.error("Erreur envoi message:", e)
      notify('Erreur lors de l\'envoi', 'error')
    } finally {
      sending.value = false
    }
  }

  const selectTicket = (ticket: any) => {
    activeTicket.value = ticket
    
    // Marquer comme lu au clic
    if (isAdmin && !ticket.is_read_by_admin) {
        pb.collection('tickets').update(ticket.id, { is_read_by_admin: true }).catch(() => {})
        ticket.is_read_by_admin = true
    } 
    else if (!isAdmin && !ticket.is_read_by_user) {
        pb.collection('tickets').update(ticket.id, { is_read_by_user: true }).catch(() => {})
        ticket.is_read_by_user = true
    }

    fetchMessages(ticket.id)
  }

  return {
    tickets,
    activeTicket,
    messages,
    loading,
    loadingMessages,
    sending,
    fetchTickets,
    createTicket,
    selectTicket,
    sendMessage,
    updateStatus
  }
}