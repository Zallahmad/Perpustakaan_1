'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, Check, X, Clock, BookOpen, Users, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Notification {
  id: string
  type: 'borrowing' | 'book' | 'member' | 'system'
  title: string
  message: string
  time: string
  read: boolean
}

interface NotificationsDropdownProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
}

export default function NotificationsDropdown({
  notifications: initialNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || [])

  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications)
    }
  }, [initialNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'borrowing':
        return <BookOpen className="w-4 h-4 text-blue-600" />
      case 'book':
        return <BookOpen className="w-4 h-4 text-emerald-600" />
      case 'member':
        return <Users className="w-4 h-4 text-amber-600" />
      case 'system':
        return <AlertCircle className="w-4 h-4 text-rose-600" />
      default:
        return <Bell className="w-4 h-4 text-secondary-600" />
    }
  }

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'borrowing':
        return 'bg-blue-50'
      case 'book':
        return 'bg-emerald-50'
      case 'member':
        return 'bg-amber-50'
      case 'system':
        return 'bg-rose-50'
      default:
        return 'bg-secondary-50'
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    if (onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    if (onMarkAllAsRead) {
      onMarkAllAsRead()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-secondary-500 hover:bg-secondary-100 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-secondary-200 z-20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-secondary-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-secondary-900">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-secondary-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-secondary-50 transition-colors cursor-pointer",
                        !notification.read && "bg-blue-50/50"
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${getNotificationBg(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-secondary-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-secondary-600 mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="w-3 h-3 text-secondary-400" />
                            <span className="text-xs text-secondary-400">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-secondary-400" />
                  </div>
                  <p className="text-sm font-medium text-secondary-900 mb-1">Tidak ada notifikasi</p>
                  <p className="text-xs text-secondary-500">Semua notifikasi sudah dibaca</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-secondary-100 bg-secondary-50">
              <button
                className="w-full text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
