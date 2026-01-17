// app/server/api/stripe/portal.post.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
} as any)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { customerId, returnUrl, flow, subscriptionId } = body
  
  // L'URL de base de ton site pour le retour
  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!customerId) {
    throw createError({ statusCode: 400, statusMessage: 'Client ID manquant' })
  }

  try {
    const params: any = {
      customer: customerId,
      return_url: returnUrl || `${appUrl}/dashboard`,
    }

    // Gestion des flux spécifiques (Deep linking vers une action précise)
    if (flow === 'payment_method_update') {
      params.flow_data = { type: 'payment_method_update' }
    } else if (flow === 'subscription_cancel' && subscriptionId) {
      params.flow_data = { 
        type: 'subscription_cancel',
        subscription_cancel: { subscription: subscriptionId }
      }
    }

    // Création de la session du portail client
    const session = await stripe.billingPortal.sessions.create(params)

    return { url: session.url }
  } catch (e: any) {
    console.error("Erreur Portail Stripe:", e)
    throw createError({ statusCode: 500, statusMessage: "Impossible de créer le lien du portail" })
  }
})