import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit-log'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, user_id, user_email, entity_type, entity_id, metadata } = body

    // Basic validation
    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: action, user_id' },
        { status: 400 }
      )
    }

    await logAudit({
      user_id,
      user_email: user_email || 'unknown',
      action,
      entity_type,
      entity_id,
      metadata,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audit log error:', error)
    // Don't fail the request if audit logging fails
    return NextResponse.json({ success: true })
  }
}
