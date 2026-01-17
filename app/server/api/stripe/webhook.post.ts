// server/api/stripe/webhook.post.ts
import Stripe from 'stripe'
import PocketBase from 'pocketbase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
} as any)

export default defineEventHandler(async (event) => {
  console.log('📥 [Webhook] Requête entrante détectée !')

  const signature = getHeader(event, 'stripe-signature')
  const body = await readRawBody(event)

  if (!signature || !body) {
    console.error('❌ [Webhook] Erreur : Signature ou corps manquant')
    throw createError({ statusCode: 400, statusMessage: 'Signature manquante' })
  }

  let stripeEvent

  try {
    // Vérification que l'événement vient bien de Stripe
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('❌ [Webhook] Erreur signature:', err.message)
    console.error('   👉 Vérifie que STRIPE_WEBHOOK_SECRET dans .env correspond à celui du terminal "stripe listen"')
    throw createError({ statusCode: 400, statusMessage: `Webhook Error: ${err.message}` })
  }

  // On s'intéresse uniquement à l'événement de paiement réussi
  if (stripeEvent.type === 'checkout.session.completed') {
    console.log('🔔 [Webhook] Événement reçu : checkout.session.completed')
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    
    // On récupère l'ID de l'utilisateur (passé lors de la création de la session)
    // On vérifie client_reference_id ET metadata.userId par sécurité
    const userId = session.client_reference_id || session.metadata?.userId
    const customerId = session.customer as string

    if (userId) {
      console.log(`👤 [Webhook] Mise à jour Premium pour l'utilisateur : ${userId}`)
      try {
        // Connexion admin à PocketBase pour pouvoir modifier l'utilisateur
        const pb = new PocketBase(process.env.POCKETBASE_URL)
        
        // Authentification
        await pb.admins.authWithPassword(
          process.env.POCKETBASE_ADMIN_EMAIL || '',
          process.env.POCKETBASE_ADMIN_PASSWORD || ''
        )

        // Récupération des détails de l'abonnement pour avoir la date de fin
        let subscriptionEnd = ''
        let subscriptionId = ''

        if (session.subscription) {
            const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
            subscriptionId = subId
            const subscription = await stripe.subscriptions.retrieve(subId) as any
            subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString()
        }

        // Mise à jour de l'utilisateur
        // Adapte 'is_premium' selon le nom de ton champ dans PocketBase
        await pb.collection('users').update(userId, {
          stripe_customer_id: customerId,
          role: 2,
          subscription_end: subscriptionEnd,
          current_period_end: subscriptionEnd, // On remplit ton champ existant
          stripe_subscription_id: subscriptionId // On sauvegarde l'ID de l'abonnement
        })
        
        console.log(`✅ [Webhook] SUCCÈS : Utilisateur ${userId} est maintenant Premium (Role 2) !`)
      } catch (error: any) {
        console.error('❌ [Webhook] Erreur PocketBase :', error.message)
        
        // Erreur d'authentification (souvent due aux caractères spéciaux dans le .env)
        if (error.status === 400) {
          console.error('💡 CONSEIL : Échec de l\'authentification Admin.')
          console.error('   👉 Vérifiez que POCKETBASE_ADMIN_EMAIL et POCKETBASE_ADMIN_PASSWORD sont corrects dans le fichier .env.')
          console.error('   👉 Si le mot de passe contient des caractères spéciaux ($, *, #), entourez-le de guillemets : POCKETBASE_ADMIN_PASSWORD="..."')
        }

        // Détection spécifique du problème de version (SDK v0.23+ vs Serveur v0.22-)
        if (error.status === 404 && error.url?.includes('_superusers')) {
          console.error('💡 CONSEIL : Votre serveur PocketBase est trop ancien pour le SDK installé.')
          console.error('   👉 Veuillez mettre à jour votre fichier pocketbase.exe vers la version v0.23.0 ou supérieure.')
        }
      }
    } else {
      console.warn('⚠️ [Webhook] Attention : Pas de userId trouvé dans la session Stripe')
    }
  }

  return { received: true }
})