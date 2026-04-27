'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { 
  BookOpen, 
  Library, 
  Users, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Book,
  Calendar,
  Plus,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatNumber, formatCurrency, formatDate } from '@/lib/utils'
import type { DashboardStats, MonthlyBorrowingStats, MostBorrowedBook, RecentBorrowing } from '@/types'
import StorageUsage from '@/components/StorageUsage'
import Link from 'next/link'
import { Notification } from '@/components/NotificationsDropdown'

async function getDashboardStats(supabase: any): Promise<DashboardStats> {
  const [
    { count: totalBooks },
    { count: totalEBooks },
    { count: totalMembers },
    { count: activeBorrowings }
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('ebooks').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('borrowings').select('*', { count: 'exact', head: true }).eq('status', 'dipinjam')
  ])

  return {
    totalBooks: totalBooks || 0,
    totalEBooks: totalEBooks || 0,
    totalMembers: totalMembers || 0,
    activeBorrowings: activeBorrowings || 0
  }
}

async function getMonthlyStats(supabase: any): Promise<MonthlyBorrowingStats[]> {
  const currentDate = new Date()
  const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)
  
  const { data } = await supabase
    .from('borrowings')
    .select('borrow_date, status, fines(amount)')
    .gte('borrow_date', sixMonthsAgo.toISOString())
    .order('borrow_date', { ascending: true })

  if (!data) return []

  const grouped = data.reduce((acc: any, item: any) => {
    const month = item.borrow_date.slice(0, 7)
    if (!acc[month]) {
      acc[month] = { month, total_borrowings: 0, total_returns: 0, total_late: 0, total_fines: 0 }
    }
    acc[month].total_borrowings++
    if (item.status === 'kembali') acc[month].total_returns++
    if (item.status === 'terlambat') acc[month].total_late++
    if (item.fines && item.fines.length > 0) {
      acc[month].total_fines += item.fines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
    }
    return acc
  }, {})

  return Object.values(grouped)
}

async function getMostBorrowedBooks(supabase: any): Promise<MostBorrowedBook[]> {
  const { data } = await supabase
    .from('borrowings')
    .select('book_id, books(id, title, author, cover_url, categories(name))')
    .limit(100)

  if (!data) return []

  const bookCounts = data.reduce((acc: any, item: any) => {
    const book = item.books
    if (!book) return acc
    if (!acc[book.id]) {
      acc[book.id] = { ...book, category: book.categories?.name, borrow_count: 0 }
    }
    acc[book.id].borrow_count++
    return acc
  }, {})

  return Object.values(bookCounts)
    .sort((a: any, b: any) => b.borrow_count - a.borrow_count)
    .slice(0, 5) as MostBorrowedBook[]
}

async function getRecentBorrowings(supabase: any): Promise<RecentBorrowing[]> {
  const { data } = await supabase
    .from('borrowings')
    .select('id, borrowing_number, borrow_date, due_date, status, member:members(full_name, member_number), book:books(title, author)')
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyBorrowingStats[]>([])
  const [mostBorrowed, setMostBorrowed] = useState<MostBorrowedBook[]>([])
  const [recentBorrowings, setRecentBorrowings] = useState<RecentBorrowing[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'borrowing',
      title: 'Peminjaman Baru',
      message: 'Budi Santoso meminjam "Laskar Pelangi"',
      time: '5 menit yang lalu',
      read: false
    },
    {
      id: '2',
      type: 'book',
      title: 'Buku Baru Ditambahkan',
      message: 'Buku "Atomic Habits" berhasil ditambahkan',
      time: '1 jam yang lalu',
      read: false
    },
    {
      id: '3',
      type: 'member',
      title: 'Member Baru',
      message: 'Siti Aminah telah mendaftar sebagai member',
      time: '2 jam yang lalu',
      read: true
    },
    {
      id: '4',
      type: 'system',
      title: 'Pengingat Pengembalian',
      message: '3 buku akan jatuh tempo hari ini',
      time: '3 jam yang lalu',
      read: true
    }
  ])

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, monthlyData, mostBorrowedData, recentData] = await Promise.all([
          getDashboardStats(supabase),
          getMonthlyStats(supabase),
          getMostBorrowedBooks(supabase),
          getRecentBorrowings(supabase)
        ])
        setStats(statsData)
        setMonthlyStats(monthlyData)
        setMostBorrowed(mostBorrowedData)
        setRecentBorrowings(recentData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <DashboardLayout 
        title="Dashboard" 
        subtitle="Ringkasan perpustakaan hari ini"
        showCTA={true}
        ctaButton={{ label: 'Tambah Buku', href: '/books' }}
        notifications={notifications}
      >
        <div className="space-y-8">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          {/* Chart Skeleton */}
          <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-80"></div>
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    { 
      label: 'Total Buku', 
      value: stats?.totalBooks || 0, 
      icon: BookOpen, 
      color: 'bg-blue-50 text-blue-600',
      trend: '+12%',
      trendUp: true,
      description: 'Buku fisik tersedia'
    },
    { 
      label: 'Total E-Book', 
      value: stats?.totalEBooks || 0, 
      icon: Library, 
      color: 'bg-emerald-50 text-emerald-600',
      trend: '+5%',
      trendUp: true,
      description: 'Buku digital'
    },
    { 
      label: 'Total Member', 
      value: stats?.totalMembers || 0, 
      icon: Users, 
      color: 'bg-orange-50 text-orange-600',
      trend: '+8%',
      trendUp: true,
      description: 'Terdaftar aktif'
    },
    { 
      label: 'Peminjaman Aktif', 
      value: stats?.activeBorrowings || 0, 
      icon: RotateCcw, 
      color: 'bg-red-50 text-red-600',
      trend: '-3%',
      trendUp: false,
      description: 'Sedang dipinjam'
    },
  ]

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Ringkasan perpustakaan hari ini"
      showCTA={true}
      ctaButton={{ label: 'Tambah Buku', href: '/books' }}
      notifications={notifications}
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div 
                key={stat.label} 
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trendUp ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.trend}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {formatNumber(stat.value)}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-xs text-slate-400">{stat.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions CTA */}
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/books" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            <BookOpen className="w-4 h-4" />
            Tambah Buku
          </Link>
          <Link 
            href="/members" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
          >
            <Users className="w-4 h-4" />
            Tambah Member
          </Link>
          <Link 
            href="/borrowings" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            Buat Peminjaman
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Grafik Peminjaman</h3>
                <p className="text-sm text-slate-500 mt-1">Statistik 6 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {monthlyStats.length > 0 ? (
                <div className="h-64 flex items-end justify-between gap-3">
                  {monthlyStats.map((stat, index) => {
                    const maxValue = Math.max(...monthlyStats.map(s => s.total_borrowings), 1)
                    const height = (stat.total_borrowings / maxValue) * 100
                    const monthName = new Date(stat.month + '-01').toLocaleDateString('id-ID', { month: 'short' })
                    
                    return (
                      <div key={stat.month} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full flex justify-center">
                          <div 
                            className="w-full max-w-[48px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-300 group-hover:from-primary-700 group-hover:to-primary-500"
                            style={{ height: `${Math.max(height * 2.2, 24)}px` }}
                          />
                          <div className="absolute -top-10 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                            {stat.total_borrowings} peminjaman
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-500">{monthName}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Belum ada data peminjaman</p>
                  <p className="text-xs text-slate-500 mb-4">Mulai tambahkan buku ke perpustakaan</p>
                  <Link 
                    href="/books" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Buku
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <StorageUsage />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Most Borrowed Books */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Buku Terpopuler</h3>
                <p className="text-sm text-slate-500 mt-1">Paling sering dipinjam</p>
              </div>
              <Link 
                href="/books" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="p-0">
              {mostBorrowed.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {mostBorrowed.map((book, index) => (
                    <div 
                      key={book.id} 
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-slate-100 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary-600">
                          {book.borrow_count}
                        </span>
                        <span className="text-xs text-slate-400">peminjaman</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Book className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Belum ada data</p>
                  <p className="text-xs text-slate-500 mb-4">Mulai tambahkan buku ke perpustakaan</p>
                  <Link 
                    href="/books" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Buku
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Borrowings */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Peminjaman Terbaru</h3>
                <p className="text-sm text-slate-500 mt-1">Aktivitas terkini</p>
              </div>
              <Link 
                href="/borrowings" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              {recentBorrowings.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Buku</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentBorrowings.map((borrowing) => (
                      <tr 
                        key={borrowing.id} 
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{borrowing.member?.full_name}</p>
                            <p className="text-xs text-slate-500">{borrowing.member?.member_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{borrowing.book?.title}</p>
                            <p className="text-xs text-slate-500">{borrowing.book?.author}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">{formatDate(borrowing.borrow_date)}</p>
                          <p className="text-xs text-slate-400">Tempo: {formatDate(borrowing.due_date)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            borrowing.status === 'dipinjam' 
                              ? 'bg-amber-50 text-amber-700' 
                              : borrowing.status === 'kembali' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {borrowing.status === 'dipinjam' ? (
                              <Clock className="w-3 h-3" />
                            ) : borrowing.status === 'kembali' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {borrowing.status === 'dipinjam' ? 'Dipinjam' :
                             borrowing.status === 'kembali' ? 'Dikembalikan' :
                             'Terlambat'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <RotateCcw className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Belum ada peminjaman</p>
                  <p className="text-xs text-slate-500 mb-4">Mulai buat peminjaman buku</p>
                  <Link 
                    href="/borrowings" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Peminjaman
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
