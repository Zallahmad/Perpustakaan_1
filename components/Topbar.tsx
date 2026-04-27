'use client'

import { useState } from 'react'
import { Bell, Search, Plus, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import NotificationsDropdown, { Notification } from './NotificationsDropdown'

interface TopbarProps {
  title: string
  subtitle?: string
  userName?: string
  userRole?: string
  ctaButton?: {
    label: string
    href: string
  }
  notifications?: Notification[]
}

export default function Topbar({ title, subtitle, userName, userRole, ctaButton, notifications }: TopbarProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 w-64 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari buku, member, atau transaksi..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* CTA Button */}
          {ctaButton && (
            <Link
              href={ctaButton.href}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {ctaButton.label}
            </Link>
          )}

          {/* Notifications */}
          <NotificationsDropdown notifications={notifications} />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-900">{userName || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{userRole || 'Admin'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4" />
                    Pengaturan
                  </Link>
                  <hr className="my-2 border-slate-100" />
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 w-full">
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
