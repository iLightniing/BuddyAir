// app/server/api/admin/users/update.post.ts
import Stripe from 'stripe'
import PocketBase from 'pocketbase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
} as any)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, role, extensionDate } = body

  // 1. Vérification Admin (Sécurité)
  const pbClient = new PocketBase(process.env.POCKETBASE_URL)
  const cookie = getHeader(event, 'cookie')
  pbClient.authStore.loadFromCookie(cookie || '')

  if (!pbClient.authStore.isValid || pbClient.authStore.model?.role !== 3) {
      throw createError({ statusCode: 403, statusMessage: 'Accès interdit. Droits administrateur requis.' })
  }

  const pb = new PocketBase(process.env.POCKETBASE_URL)
  await pb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL || '',
    process.env.POCKETBASE_ADMIN_PASSWORD || ''
  )

  try {
    const user = await pb.collection('users').getOne(id)
    const updates: any = { role }

    // 2. Gestion de l'extension Premium
    if (role === 2 && extensionDate) {
        const newEndDate = new Date(extensionDate)
        updates.current_period_end = newEndDate.toISOString()
        updates.subscription_end = newEndDate.toISOString()

        // Si l'utilisateur a un abonnement Stripe ACTIF
        if (user.stripe_subscription_id) {
            try {
                // On récupère l'abonnement pour vérifier son statut
                const sub = await stripe.subscriptions.retrieve(user.stripe_subscription_id)
                
                if (sub.status === 'active' || sub.status === 'trialing') {
                    // L'astuce : On définit une période d'essai qui se termine à la nouvelle date.
                    // Stripe ne facturera rien jusqu'à cette date.
                    await stripe.subscriptions.update(user.stripe_subscription_id, {
                        trial_end: Math.floor(newEndDate.getTime() / 1000),
                        proration_behavior: 'none' // Pas de facture au prorata générée maintenant
                    })
                    console.log(`✅ Stripe: Abonnement prolongé (trial) jusqu'au ${newEndDate} pour ${user.email}`)
                }
            } catch (stripeError) {
                console.error("⚠️ Erreur Stripe lors de l'extension:", stripeError)
                // On continue quand même pour mettre à jour la BDD locale
            }
        }
    } 
    // Si on repasse en Gratuit (Role 1)
    else if (role === 1) {
        updates.current_period_end = ''
        updates.subscription_end = ''
        
        // On annule l'abonnement Stripe immédiatement si existant
        if (user.stripe_subscription_id) {
            try {
                await stripe.subscriptions.cancel(user.stripe_subscription_id)
            } catch (e) {}
            updates.stripe_subscription_id = ''
        }
    }

    // 3. Mise à jour PocketBase
    await pb.collection('users').update(id, updates)

    return { success: true }
  } catch (e: any) {
    console.error("Erreur update user:", e)
    throw createError({ statusCode: 500, statusMessage: e.message })
  }
})