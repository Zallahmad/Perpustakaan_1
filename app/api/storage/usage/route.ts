import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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

export async function GET(request: Request) {
  // Rate limiting: 20 requests per minute for storage usage
  const identifier = getRateLimitIdentifier(request)
  const rateLimitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 20 })
  
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
    const bucketName = 'library-assets'
    
    // List all files in the bucket
    const { data: files, error } = await supabaseAdmin
      .storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        offset: 0,
      })

    if (error) {
      console.error('Storage list error:', error)
      // Check if bucket doesn't exist
      if (error.message?.includes('The resource was not found') || error.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { 
            error: 'Bucket library-assets belum ada. Silakan buat bucket di Supabase Storage.',
            bucketExists: false 
          },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Gagal mengambil data storage: ' + error.message },
        { status: 500 }
      )
    }

    // Calculate total size and breakdown by folder
    let totalSize = 0
    let actualFileCount = 0
    const breakdown: Record<string, number> = {
      'book-covers': 0,
      'member-photos': 0,
      'ebook-covers': 0,
      'other': 0,
    }

    console.log('Files from storage:', files)

    for (const file of files || []) {
      // Skip folders (items without size)
      if (!file.metadata?.size) {
        console.log('Skipping folder/no-size item:', file.name)
        continue
      }
      
      actualFileCount++
      totalSize += file.metadata.size
      
      // Categorize by folder
      if (file.name.startsWith('book-covers/')) {
        breakdown['book-covers'] += file.metadata.size
      } else if (file.name.startsWith('member-photos/')) {
        breakdown['member-photos'] += file.metadata.size
      } else if (file.name.startsWith('ebook-covers/')) {
        breakdown['ebook-covers'] += file.metadata.size
      } else {
        breakdown['other'] += file.metadata.size
      }
    }

    // Format sizes
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return NextResponse.json({
      totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      fileCount: actualFileCount,
      bucketExists: true,
      breakdown: {
        'book-covers': {
          size: breakdown['book-covers'],
          formatted: formatBytes(breakdown['book-covers']),
        },
        'member-photos': {
          size: breakdown['member-photos'],
          formatted: formatBytes(breakdown['member-photos']),
        },
        'ebook-covers': {
          size: breakdown['ebook-covers'],
          formatted: formatBytes(breakdown['ebook-covers']),
        },
        'other': {
          size: breakdown['other'],
          formatted: formatBytes(breakdown['other']),
        },
      },
    })
  } catch (error) {
    console.error('Storage usage error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data storage. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
