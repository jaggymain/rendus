import type { ModelInfo } from './models'

/**
 * Get the credit cost display string for a model
 * Returns the cost in a user-friendly format
 */
export function getModelCreditCost(model: ModelInfo): string | null {
    // Variable pricing (megapixels, compute seconds, etc.)
    if (model.pricing_type === 'variable') {
        return 'Variable'
    }

    // Flat credit cost (most images)
    if (model.credits !== undefined) {
        return `${model.credits} coin${model.credits !== 1 ? 's' : ''}`
    }

    // Flat credit cost (some videos)
    if (model.credits_flat !== undefined) {
        return `${model.credits_flat} coin${model.credits_flat !== 1 ? 's' : ''}`
    }

    // Per-second video pricing
    if (model.credits_per_5sec !== undefined) {
        return `${model.credits_per_5sec} coin${model.credits_per_5sec !== 1 ? 's' : ''}/5sec`
    }

    return null
}

/**
 * Get a short credit badge text for compact display
 */
export function getCreditBadge(model: ModelInfo): string | null {
    // Variable pricing (megapixels, compute seconds, etc.)
    if (model.pricing_type === 'variable') {
        return 'variable'
    }

    if (model.credits !== undefined) {
        return `${model.credits}`
    }

    if (model.credits_flat !== undefined) {
        return `${model.credits_flat}`
    }

    if (model.credits_per_5sec !== undefined) {
        return `${model.credits_per_5sec}/5s`
    }

    return null
}

/**
 * Calculate credits for a specific generation
 * Used for preview before generation
 */
export function calculateGenerationCredits(
    model: ModelInfo,
    options: {
        durationSeconds?: number
        numImages?: number
    } = {}
): { credits: number; breakdown: string } | null {
    const { durationSeconds = 5, numImages = 1 } = options

    // Variable pricing - cannot calculate exact cost
    if (model.pricing_type === 'variable') {
        return null
    }

    // Flat-rate models
    if (model.credits !== undefined) {
        const total = model.credits * numImages
        return {
            credits: total,
            breakdown: numImages > 1
                ? `${model.credits} coins × ${numImages} image${numImages > 1 ? 's' : ''}`
                : `${model.credits} coin${model.credits !== 1 ? 's' : ''}`
        }
    }

    if (model.credits_flat !== undefined) {
        return {
            credits: model.credits_flat,
            breakdown: `${model.credits_flat} coin${model.credits_flat !== 1 ? 's' : ''}`
        }
    }

    // Per-second video pricing
    if (model.credits_per_5sec !== undefined) {
        const totalCredits = Math.ceil((durationSeconds / 5) * model.credits_per_5sec)
        return {
            credits: totalCredits,
            breakdown: `${model.credits_per_5sec} coins/5sec × ${durationSeconds}s = ${totalCredits} coins`
        }
    }

    return null
}
