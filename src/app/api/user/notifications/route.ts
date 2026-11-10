import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // In a real app, you'd save to a notifications preferences table
    // For now, just return success
    console.log('Notification preferences updated:', body)

    return NextResponse.json({ message: 'Preferences saved', preferences: body })
  } catch (error) {
    console.error('Notifications update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}