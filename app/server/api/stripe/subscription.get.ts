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
      status: 'active',
      limit: 1,
      expand: ['data.plan.product'] // Pour avoir le nom du produit
    })

    if (subscriptions.data.length === 0) {
      return { active: false }
    }

    const sub = subscriptions.data[0] as any
    
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