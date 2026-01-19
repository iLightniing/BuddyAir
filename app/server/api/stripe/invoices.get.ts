// d:\Apprentissage\Javascript\Projets\BuddyAir\app\server\api\stripe\invoices.get.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
} as any)

export default defineEventHandler(async (event) => {
  const { customerId } = getQuery(event)

  if (!customerId) {
    throw createError({ statusCode: 400, statusMessage: 'Customer ID manquant' })
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId as string,
      limit: 24, // Les 24 dernières factures
    })

    return invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      pdf_url: invoice.invoice_pdf,
      hosted_url: invoice.hosted_invoice_url,
      number: invoice.number
    }))
  } catch (e: any) {
    console.error('Erreur récupération factures:', e)
    throw createError({ statusCode: 500, statusMessage: e.message })
  }
})