import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { logAudit, AuditActions } from '@/lib/audit-log'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
  
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    return null
  }
  
  // Check if user has admin or petugas role
  const { data: roleData } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle()
  
  if (!roleData || !['admin', 'petugas'].includes(roleData.role)) {
    return null
  }
  
  return session
}

export async function POST(request: Request) {
  // Rate limiting: 5 requests per minute for create user
  const identifier = getRateLimitIdentifier(request)
  const rateLimitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 5 })
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429 }
    )
  }

  // Check authentication
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - admin access required' },
      { status: 401 }
    )
  }
  try {
    const body = await request.json()
    const { email, password, full_name, member_type, nis_nip, class: studentClass, phone, address } = body

    console.log('Create user request by:', session.user.email, { email, full_name, member_type })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    console.log('Creating Supabase admin client...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service role key exists:', !!supabaseServiceKey)

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        member_type,
      },
    })

    console.log('Auth response:', { authData, authError })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Gagal membuat user auth' },
        { status: 400 }
      )
    }

    // Set user role in user_roles table
    console.log('Setting user role for user_id:', authData.user.id)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: member_type === 'guru' ? 'guru' : 'member',
      })

    console.log('Role insert response:', { roleError })

    if (roleError) {
      console.error('Role error:', roleError)
      return NextResponse.json(
        { error: 'Gagal set role user: ' + roleError.message },
        { status: 500 }
      )
    }

    // Create member record automatically
    console.log('Creating member record for user_id:', authData.user.id)
    const { error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        user_id: authData.user.id,
        full_name,
        email,
        phone: phone || null,
        member_type,
        nis_nip: nis_nip || null,
        class: studentClass || null,
        address: address || null,
      })

    console.log('Member insert response:', { memberError })

    if (memberError) {
      console.error('Member error:', memberError)
      return NextResponse.json(
        { error: 'Gagal membuat data member: ' + memberError.message },
        { status: 500 }
      )
    }

    // Audit log
    await logAudit({
      user_id: session.user.id,
      user_email: session.user.email!,
      action: AuditActions.USER_CREATED,
      entity_type: 'user',
      entity_id: authData.user.id,
      metadata: {
        created_email: email,
        member_type,
        created_by: session.user.email,
      },
    })

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      email: authData.user.email,
    })
  } catch (error) {
    console.error('Create user error:', error)
    
    // Log error for debugging
    await logAudit({
      user_id: session?.user.id || 'unknown',
      user_email: session?.user.email || 'unknown',
      action: 'USER_CREATE_FAILED',
      metadata: {
        error: (error as Error).message,
      },
    })
    
    // User-friendly error message
    return NextResponse.json(
      { error: 'Gagal membuat user. Silakan coba lagi atau hubungi admin.' },
      { status: 500 }
    )
  }
}
