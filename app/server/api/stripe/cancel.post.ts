import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
} as any)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { subscriptionId } = body

  if (!subscriptionId) {
    throw createError({ statusCode: 400, statusMessage: 'Subscription ID required' })
  }

  try {
    // Annulation à la fin de la période (pas immédiate)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
    return { success: true, subscription }
  } catch (e: any) {
    console.error('Erreur annulation Stripe:', e)
    throw createError({ statusCode: 500, statusMessage: e.message })
  }
})