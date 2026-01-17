// d:\Apprentissage\Javascript\Projets\BuddyAir\server\api\stripe\checkout.post.ts

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
} as any)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, email, plan, returnUrl } = body
  
  console.log(`💳 Création session Stripe pour l'utilisateur: ${userId} (Plan: ${plan})`)

  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Récupération des ID de prix depuis les variables d'environnement
  // Tu dois créer ces produits dans ton Dashboard Stripe et copier les ID (ex: price_1P...)
  const priceId = plan === 'yearly' 
    ? process.env.STRIPE_PRICE_YEARLY 
    : process.env.STRIPE_PRICE_MONTHLY

  if (!priceId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Configuration des prix Stripe manquante (Vérifie ton fichier .env)' 
    })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/payment/success?from=${encodeURIComponent(returnUrl || '/dashboard')}`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,
      metadata: {
        userId: userId,
        plan: plan
      },
      // Active les codes promo si tu en as configuré
      allow_promotion_codes: true,
    })

    return { url: session.url }
  } catch (e: any) {
    console.error('Erreur Stripe:', e)
    throw createError({ 
      statusCode: 500, 
      statusMessage: e.message 
    })
  }
})