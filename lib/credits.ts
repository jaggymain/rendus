import { prisma } from './prisma'
import { IMAGE_MODELS, VIDEO_MODELS, IMAGE_TO_VIDEO_MODELS, IMAGE_TO_IMAGE_MODELS } from './models-curated'

// Build credit costs from all curated models
const allModels = [...IMAGE_MODELS, ...VIDEO_MODELS, ...IMAGE_TO_VIDEO_MODELS, ...IMAGE_TO_IMAGE_MODELS]
const modelCredits = allModels.reduce((acc, model) => {
  if (model.credits !== undefined) {
    acc[model.id] = model.credits
  }
  return acc
}, {} as Record<string, number>)

export const CREDIT_COSTS: Record<string, number> = {
  ...modelCredits,
  default: 1,
}

export function getCreditCost(modelId: string): number {
  return CREDIT_COSTS[modelId] ?? CREDIT_COSTS.default
}

export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })
  return user?.credits ?? 0
}

export async function hasEnoughCredits(userId: string, modelId: string): Promise<boolean> {
  const credits = await getUserCredits(userId)
  const cost = getCreditCost(modelId)
  return credits >= cost
}

export async function deductCredits(userId: string, modelId: string): Promise<{ success: boolean; remaining: number; cost: number }> {
  const cost = getCreditCost(modelId)
  
  // Use a transaction to ensure atomicity
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: cost,
      },
    },
    select: { credits: true },
  })
  
  return {
    success: true,
    remaining: user.credits,
    cost,
  }
}

export async function refundCredits(userId: string, amount: number): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: amount,
      },
    },
    select: { credits: true },
  })
  return user.credits
}

export async function addCredits(userId: string, amount: number, stripePaymentId?: string): Promise<number> {
  // Create purchase record and add credits in a transaction
  const [, user] = await prisma.$transaction([
    prisma.creditPurchase.create({
      data: {
        userId,
        credits: amount,
        amount: calculatePriceInCents(amount),
        stripePaymentId,
        status: 'completed',
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
      select: { credits: true },
    }),
  ])
  
  return user.credits
}

// Credit packages for purchase
export const CREDIT_PACKAGES = [
  { id: 'starter', credits: 50, price: 500, label: '50 Credits', description: 'Perfect for trying out' },
  { id: 'creator', credits: 200, price: 1500, label: '200 Credits', description: 'Best value', popular: true },
  { id: 'pro', credits: 500, price: 3000, label: '500 Credits', description: 'For power users' },
] as const

export function calculatePriceInCents(credits: number): number {
  const pkg = CREDIT_PACKAGES.find(p => p.credits === credits)
  return pkg?.price ?? credits * 10
}
