'use client'

import { useState, useEffect } from 'react'
import GuruLayout from '@/components/GuruLayout'
import { createClient } from '@/lib/supabase'
import { Book, Borrowing } from '@/types'
import { 
  RotateCcw,
  Clock,
  Calendar,
  BookOpen
} from 'lucide-react'
import { formatDate, calculateDaysOverdue, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function PeminjamanSayaPage() {
  const supabase = createClient()
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBorrowings() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Get member data
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (!member) return

        // Fetch borrowings
        const { data, error } = await supabase
          .from('borrowings')
          .select('*, book:books(*), member:members(*)')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setBorrowings(data || [])
      } catch (error) {
        console.error('Error fetching borrowings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowings()
  }, [supabase])

  const activeBorrowings = borrowings.filter(b => b.status === 'dipinjam')
  const returnedBorrowings = borrowings.filter(b => b.status !== 'dipinjam')

  return (
    <GuruLayout title="Peminjaman Saya" subtitle="Daftar buku yang Anda pinjam">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Borrowings */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Sedang Dipinjam ({activeBorrowings.length})
              </h3>
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
                  {activeBorrowings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-secondary-500 py-8">
                        Tidak ada peminjaman aktif
                      </td>
                    </tr>
                  ) : (
                    activeBorrowings.map((borrowing) => (
                      <tr key={borrowing.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {borrowing.book?.cover_url && (
                              <img
                                src={borrowing.book.cover_url}
                                alt={borrowing.book.title}
                                className="w-10 h-14 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-secondary-900">{borrowing.book?.title}</p>
                              <p className="text-xs text-secondary-500">{borrowing.book?.author}</p>
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(borrowing.borrow_date)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary-400" />
                            <span>{formatDate(borrowing.due_date)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusColor(borrowing.status)}`}>
                            {getStatusLabel(borrowing.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returned Borrowings */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Riwayat Peminjaman ({returnedBorrowings.length})
              </h3>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Buku</th>
                    <th>Tanggal Pinjam</th>
                    <th>Tanggal Kembali</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {returnedBorrowings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-secondary-500 py-8">
                        Belum ada riwayat peminjaman
                      </td>
                    </tr>
                  ) : (
                    returnedBorrowings.map((borrowing) => (
                      <tr key={borrowing.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {borrowing.book?.cover_url && (
                              <img
                                src={borrowing.book.cover_url}
                                alt={borrowing.book.title}
                                className="w-10 h-14 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-secondary-900">{borrowing.book?.title}</p>
                              <p className="text-xs text-secondary-500">{borrowing.book?.author}</p>
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(borrowing.borrow_date)}</td>
                        <td>{borrowing.return_date ? formatDate(borrowing.return_date) : '-'}</td>
                        <td>
                          <span className={`badge ${getStatusColor(borrowing.status)}`}>
                            {getStatusLabel(borrowing.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  )
}
