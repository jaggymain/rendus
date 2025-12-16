import Stripe from 'stripe'

// Initialize Stripe only when the secret key is available
// This prevents the app from crashing during development/testing
function getStripeInstance(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not set - Stripe features will be disabled')
    return null
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  })
}

export const stripe = getStripeInstance()

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return stripe !== null
}

// Credit package price IDs (create these in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter',
  creator: process.env.STRIPE_PRICE_CREATOR || 'price_creator', 
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
} as const

export const CREDITS_PER_PRICE = {
  [STRIPE_PRICE_IDS.starter]: 50,
  [STRIPE_PRICE_IDS.creator]: 200,
  [STRIPE_PRICE_IDS.pro]: 500,
} as const
