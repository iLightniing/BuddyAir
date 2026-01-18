import { getNextOccurrences } from '~/utils/schedule'
import { usePremium } from '~/composables/usePremium'

export const useScheduleGenerator = () => {
  const pb = usePocketBase()
  const { notify } = useNotification()
  const { isPremium } = usePremium()

  const checkAndGenerate = async () => {
    const user = pb.authStore.model
    if (!user) return

    // RESTRICTION PREMIUM : L'automatisation est réservée aux rôles >= 2 (Premium & Admin)
    // On utilise le composable pour inclure la vérification de la date d'expiration
    if (!isPremium.value) return

    // Fin du mois en cours
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    try {
      // On récupère toutes les échéances dont la prochaine date est avant ou égale à la fin du mois
      const schedules = await pb.collection('scheduled_transactions').getFullList({
        filter: `user = "${user.id}" && next_date <= "${endOfMonth.toISOString()}"`
      })

      let generatedCount = 0

      for (const schedule of schedules) {
        let nextDate = new Date(schedule.next_date)
        
        // Tant que la date prévue est dans le mois en cours (ou passée), on génère
        while (nextDate <= endOfMonth) {
             // Création de la transaction
             await pb.collection('transactions').create({
                 user: user.id,
                 account: schedule.account,
                 type: schedule.type,
                 amount: schedule.amount,
                 date: nextDate.toISOString(),
                 description: schedule.description,
                 category: schedule.category,
                 sub_category: schedule.sub_category,
                 payment_method: schedule.payment_method || 'direct_debit',
                 status: 'pending', // Non pointé par défaut
                 is_recurring: true,
                 tags: schedule.tags
             })

             // Mise à jour du solde du compte
             const account = await pb.collection('accounts').getOne(schedule.account)
             const amount = schedule.type === 'expense' ? -Math.abs(schedule.amount) : Math.abs(schedule.amount)
             await pb.collection('accounts').update(schedule.account, {
                 current_balance: account.current_balance + amount
             })

             generatedCount++

             // Calcul de la prochaine occurrence (on avance d'un jour pour forcer le calcul de la suivante)
             const nextDates = getNextOccurrences(new Date(nextDate.getTime() + 86400000).toISOString(), schedule.frequency, schedule.day_of_month, schedule.shift_weekends, 1)
             if (!nextDates[0]) break
             nextDate = nextDates[0]
        }

        // Mise à jour de l'échéance avec la nouvelle date future
        await pb.collection('scheduled_transactions').update(schedule.id, { next_date: nextDate.toISOString() })
      }
      
      if (generatedCount > 0) notify(`${generatedCount} échéance(s) générée(s) pour ce mois.`, 'success')
    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError') && !(e as any)?.isAbort) {
        console.error("Erreur génération échéances:", e)
      }
    }
  }

  return { checkAndGenerate }
}