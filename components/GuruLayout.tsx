'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface GuruLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function GuruLayout({
  children,
  title,
  subtitle,
}: GuruLayoutProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Guru')

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

      if (!roleData || roleData.role !== 'guru') {
        router.push('/unauthorized')
        return
      }

      // Get member data
      const { data: member } = await supabase
        .from('members')
        .select('full_name')
        .eq('user_id', session.user.id)
        .maybeSingle()
      
      if (member) {
        setUserName(member.full_name)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <Sidebar userRole="guru" userName={userName} />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Topbar title={title} subtitle={subtitle} />
        
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
