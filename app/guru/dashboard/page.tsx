'use client'

import { useState, useEffect } from 'react'
import GuruLayout from '@/components/GuruLayout'
import { createClient } from '@/lib/supabase'
import { 
  BookOpen, 
  Library, 
  Users, 
  RotateCcw,
  Clock
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

export default function GuruDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalEBooks: 0,
    myStudents: 0,
    myBorrowings: 0,
  })
  const [recentBorrowings, setRecentBorrowings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Get member data for current user
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (!member) return

        // Fetch stats
        const [booksCount, ebooksCount, studentsCount, borrowingsData] = await Promise.all([
          supabase.from('books').select('*', { count: 'exact', head: true }),
          supabase.from('ebooks').select('*', { count: 'exact', head: true }),
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('member_type', 'siswa'),
          supabase
            .from('borrowings')
            .select('*, book:books(title, author), member:members(full_name, member_number)')
            .eq('member_id', member.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        setStats({
          totalBooks: booksCount.count || 0,
          totalEBooks: ebooksCount.count || 0,
          myStudents: studentsCount.count || 0,
          myBorrowings: borrowingsData.data?.length || 0,
        })

        setRecentBorrowings(borrowingsData.data || [])
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
      <GuruLayout title="Dashboard" subtitle="Selamat datang, Guru">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </GuruLayout>
    )
  }

  const statCards = [
    { 
      label: 'Total Buku', 
      value: stats.totalBooks, 
      icon: BookOpen, 
      color: 'bg-primary-100 text-primary-600',
    },
    { 
      label: 'Total E-Book', 
      value: stats.totalEBooks, 
      icon: Library, 
      color: 'bg-success-100 text-success-600',
    },
    { 
      label: 'Total Siswa', 
      value: stats.myStudents, 
      icon: Users, 
      color: 'bg-warning-100 text-warning-600',
    },
    { 
      label: 'Peminjaman Saya', 
      value: stats.myBorrowings, 
      icon: RotateCcw, 
      color: 'bg-danger-100 text-danger-600',
    },
  ]

  return (
    <GuruLayout title="Dashboard" subtitle="Selamat datang, Guru">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{formatNumber(stat.value)}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Borrowings */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold text-secondary-900">Peminjaman Terbaru</h3>
          <a href="/guru/peminjaman" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Lihat Semua
          </a>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBorrowings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-secondary-500 py-8">
                    Belum ada peminjaman
                  </td>
                </tr>
              ) : (
                recentBorrowings.map((borrowing) => (
                  <tr key={borrowing.id}>
                    <td>
                      <div>
                        <p className="font-medium text-secondary-900">{borrowing.book?.title}</p>
                        <p className="text-xs text-secondary-500">{borrowing.book?.author}</p>
                      </div>
                    </td>
                    <td>{formatDate(borrowing.borrow_date)}</td>
                    <td>{formatDate(borrowing.due_date)}</td>
                    <td>
                      <span className={`badge ${
                        borrowing.status === 'dipinjam' ? 'badge-warning' :
                        borrowing.status === 'kembali' ? 'badge-success' :
                        'badge-danger'
                      }`}>
                        {borrowing.status === 'dipinjam' ? 'Dipinjam' :
                         borrowing.status === 'kembali' ? 'Dikembalikan' :
                         'Terlambat'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </GuruLayout>
  )
}
