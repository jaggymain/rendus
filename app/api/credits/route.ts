import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { getUserCredits, getCreditCost } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credits = await getUserCredits(session.user.id)
    
    return Response.json({ credits })
  } catch (error) {
    console.error('Get credits error:', error)
    return Response.json({ error: 'Failed to get credits' }, { status: 500 })
  }
}

// Get credit cost for a specific model
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { modelId } = await request.json()
    const cost = getCreditCost(modelId)
    const credits = await getUserCredits(session.user.id)
    
    return Response.json({ 
      cost, 
      credits,
      canAfford: credits >= cost,
    })
  } catch (error) {
    console.error('Get credit cost error:', error)
    return Response.json({ error: 'Failed to get credit cost' }, { status: 500 })
  }
}
