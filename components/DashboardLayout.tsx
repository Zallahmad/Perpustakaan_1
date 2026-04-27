'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { UserRole } from '@/types'
import { Notification } from './NotificationsDropdown'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  allowedRoles?: UserRole[]
  showCTA?: boolean
  ctaButton?: {
    label: string
    href: string
  }
  notifications?: Notification[]
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  allowedRoles = ['admin', 'petugas', 'guru'],
  showCTA = false,
  ctaButton,
  notifications,
}: DashboardLayoutProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!roleData || !allowedRoles.includes(roleData.role)) {
        router.push('/unauthorized')
        return
      }

      setUserRole(roleData.role as UserRole)

      // Get member data if role is member
      let name = session.user.email?.split('@')[0] || 'User'
      
      if (roleData.role === 'member') {
        const { data: member } = await supabase
          .from('members')
          .select('full_name')
          .eq('user_id', session.user.id)
          .maybeSingle()
        
        if (member) {
          name = member.full_name
        }
      }
      
      setUserName(name)
      setLoading(false)
    }

    checkAuth()
  }, [supabase, router, allowedRoles])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar userRole={userRole!} userName={userName} />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Topbar 
          title={title} 
          subtitle={subtitle} 
          userName={userName}
          userRole={userRole || undefined}
          ctaButton={showCTA ? ctaButton : undefined}
          notifications={notifications}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:pt-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
