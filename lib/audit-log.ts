import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface AuditLogEntry {
  user_id: string
  user_email: string
  action: string
  entity_type?: string
  entity_id?: string
  metadata?: Record<string, any>
  ip_address?: string
}

export async function logAudit(entry: AuditLogEntry) {
  try {
    // In production, you might want to create an audit_logs table
    // For now, we'll log to console and optionally store in a table
    console.log('AUDIT LOG:', {
      timestamp: new Date().toISOString(),
      ...entry,
    })

    // Optional: Store in database if audit_logs table exists
    // await supabaseAdmin.from('audit_logs').insert({
    //   user_id: entry.user_id,
    //   user_email: entry.user_email,
    //   action: entry.action,
    //   entity_type: entry.entity_type,
    //   entity_id: entry.entity_id,
    //   metadata: entry.metadata,
    //   ip_address: entry.ip_address,
    // })
  } catch (error) {
    console.error('Failed to log audit entry:', error)
    // Don't throw - audit logging shouldn't break the main flow
  }
}

// Common audit actions
export const AuditActions = {
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  MEMBER_CREATED: 'MEMBER_CREATED',
  MEMBER_UPDATED: 'MEMBER_UPDATED',
  MEMBER_DELETED: 'MEMBER_DELETED',
  BOOK_CREATED: 'BOOK_CREATED',
  BOOK_UPDATED: 'BOOK_UPDATED',
  BOOK_DELETED: 'BOOK_DELETED',
  BORROWING_CREATED: 'BORROWING_CREATED',
  BORROWING_UPDATED: 'BORROWING_UPDATED',
  BORROWING_DELETED: 'BORROWING_DELETED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  FILE_DELETED: 'FILE_DELETED',
} as const
