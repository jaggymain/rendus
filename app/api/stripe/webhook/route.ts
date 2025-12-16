import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { addCredits } from '@/lib/credits'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured() || !stripe) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return Response.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        const userId = session.metadata?.userId
        const credits = parseInt(session.metadata?.credits || '0', 10)
        
        if (userId && credits > 0) {
          await addCredits(userId, credits, session.payment_intent as string)
          console.log(`Added ${credits} credits to user ${userId}`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        console.log('Payment succeeded:', event.data.object.id)
        break
      }

      case 'payment_intent.payment_failed': {
        console.log('Payment failed:', event.data.object.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
