import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    await requireRole(['admin', 'master_admin'])
    const supabase = await createClient()

    // 1. Total training samples
    const { count: totalSamples, error: samplesError } = await supabase
      .from('ml_training_data')
      .select('*', { count: 'exact', head: true })

    if (samplesError) throw samplesError

    // 2. Count of uncertain tickets (confidence < 0.7)
    // We need to exclude tickets that are already in ml_training_data
    // This is a bit tricky with Supabase's simple JS client without a subquery or join
    // For now, let's just get the count of low confidence tickets
    const { count: uncertainCount, error: uncertainError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .lt('ml_confidence', 0.7)
      // Ideally we'd filter out those already in ml_training_data
      // But for stats, let's keep it simple first or fetch IDs

    if (uncertainError) throw uncertainError

    // 3. Get latest model version from ml_training_data or tickets
    const { data: latestModelData } = await supabase
      .from('tickets')
      .select('ml_model_version')
      .not('ml_model_version', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      totalSamples: totalSamples || 0,
      uncertainCount: uncertainCount || 0,
      modelVersion: latestModelData?.ml_model_version || 'v1.0.0'
    })

  } catch (error: unknown) {
    console.error('Error in ML stats route:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
