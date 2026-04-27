'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  RotateCcw,
  Library,
  FileText,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

type UserRole = 'admin' | 'petugas' | 'member' | 'guru'

interface SidebarProps {
  userRole: UserRole
  userName: string
}

interface MenuItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Utama',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'petugas', 'guru'],
      },
      {
        label: 'E-Book',
        href: '/ebooks',
        icon: Library,
        roles: ['admin', 'petugas', 'member', 'guru'],
      },
    ],
  },
  {
    label: 'Master Data',
    items: [
      {
        label: 'Buku',
        href: '/books',
        icon: BookOpen,
        roles: ['admin', 'petugas'],
      },
      {
        label: 'Katalog Buku',
        href: '/guru/katalog',
        icon: BookOpen,
        roles: ['guru'],
      },
      {
        label: 'Member',
        href: '/members',
        icon: Users,
        roles: ['admin', 'petugas'],
      },
      {
        label: 'Siswa Saya',
        href: '/guru/siswa',
        icon: Users,
        roles: ['guru'],
      },
    ],
  },
  {
    label: 'Transaksi',
    items: [
      {
        label: 'Peminjaman',
        href: '/borrowings',
        icon: RotateCcw,
        roles: ['admin', 'petugas'],
      },
      {
        label: 'Peminjaman Saya',
        href: '/guru/peminjaman',
        icon: RotateCcw,
        roles: ['guru'],
      },
      {
        label: 'Riwayat',
        href: '/guru/riwayat',
        icon: FileText,
        roles: ['guru'],
      },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      {
        label: 'Laporan',
        href: '/reports',
        icon: FileText,
        roles: ['admin', 'petugas'],
      },
      {
        label: 'Scan QR',
        href: '/scan',
        icon: QrCode,
        roles: ['admin', 'petugas'],
      },
      {
        label: 'Kartu Member',
        href: '/guru/kartu',
        icon: QrCode,
        roles: ['guru'],
      },
      {
        label: 'Profil',
        href: '/guru/profil',
        icon: Users,
        roles: ['guru'],
      },
    ],
  },
]

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(userRole))
  })).filter(group => group.items.length > 0)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-slate-200",
        collapsed && "justify-center"
      )}>
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white">
          <BookOpen className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-slate-900 truncate">Perpustakaan</h1>
            <p className="text-xs text-slate-500 truncate">Sekolah</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {filteredMenuGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary-600")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50",
          collapsed && "justify-center px-2"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary-700">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 capitalize truncate">{userRole}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-slate-700"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-700 z-10"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {sidebarContent}
      </aside>
    </>
  )
}
