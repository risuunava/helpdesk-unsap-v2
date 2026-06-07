import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { triggerRetrain } from '@/lib/ml'

export async function POST(_request: NextRequest) {
  try {
    await requireRole(['admin', 'master_admin'])

    const result = await triggerRetrain()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result)

  } catch (error: unknown) {
    console.error('Error in ML retrain route:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
