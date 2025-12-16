import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { CREDIT_PACKAGES } from '@/lib/credits'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return Response.json(
        { error: 'Payments are not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packageId } = await request.json()
    
    const creditPackage = CREDIT_PACKAGES.find(p => p.id === packageId)
    if (!creditPackage) {
      return Response.json({ error: 'Invalid package' }, { status: 400 })
    }

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    })

    let customerId = user?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      })
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      })
      
      customerId = customer.id
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${creditPackage.credits} Rendus Credits`,
              description: creditPackage.description,
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        credits: creditPackage.credits.toString(),
        packageId: creditPackage.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/generate?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
    })

    return Response.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
