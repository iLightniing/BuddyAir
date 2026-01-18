// app/server/api/stripe/subscription.get.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
} as any)

export default defineEventHandler(async (event) => {
  const { customerId } = getQuery(event)

  if (!customerId) {
    throw createError({ statusCode: 400, statusMessage: 'ID Client manquant' })
  }

  try {
    // On récupère l'abonnement actif
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId as string,
      status: 'all', // On récupère tout pour filtrer nous-même (active ou trialing)
      limit: 10,
      expand: ['data.plan.product'] // Pour avoir le nom du produit
    })

    // On cherche un abonnement valide (Actif ou en Essai/Extension)
    const sub = subscriptions.data.find((s: any) => s.status === 'active' || s.status === 'trialing') as any

    if (!sub) {
      return { active: false }
    }
    
    return {
      active: true,
      id: sub.id,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end, // Si l'utilisateur a demandé l'annulation à la fin du mois
      plan: {
        interval: sub.plan?.interval, // 'month' ou 'year'
        amount: sub.plan?.amount, // ex: 200 pour 2.00€
        currency: sub.plan?.currency,
      }
    }
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message })
  }
})