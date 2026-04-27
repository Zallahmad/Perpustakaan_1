'use client'

import { useState, useEffect } from 'react'
import GuruLayout from '@/components/GuruLayout'
import { createClient } from '@/lib/supabase'
import { Borrowing } from '@/types'
import { 
  Clock,
  Calendar,
  BookOpen
} from 'lucide-react'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function RiwayatPage() {
  const supabase = createClient()
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
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

        // Fetch all borrowings (returned only)
        const { data, error } = await supabase
          .from('borrowings')
          .select('*, book:books(*), member:members(*)')
          .eq('member_id', member.id)
          .neq('status', 'dipinjam')
          .order('created_at', { ascending: false })

        if (error) throw error
        setBorrowings(data || [])
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [supabase])

  return (
    <GuruLayout title="Riwayat Peminjaman" subtitle="History peminjaman buku Anda">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Buku</th>
                  <th>Tanggal Pinjam</th>
                  <th>Tanggal Kembali</th>
                  <th>Durasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary-500 py-8">
                      Belum ada riwayat peminjaman
                    </td>
                  </tr>
                ) : (
                  borrowings.map((borrowing) => {
                    const borrowDate = new Date(borrowing.borrow_date)
                    const returnDate = borrowing.return_date ? new Date(borrowing.return_date) : new Date()
                    const duration = Math.ceil((returnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24))

                    return (
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
                        <td>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary-400" />
                            <span>{formatDate(borrowing.borrow_date)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary-400" />
                            <span>{borrowing.return_date ? formatDate(borrowing.return_date) : '-'}</span>
                          </div>
                        </td>
                        <td>{duration} hari</td>
                        <td>
                          <span className={`badge ${getStatusColor(borrowing.status)}`}>
                            {getStatusLabel(borrowing.status)}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </GuruLayout>
  )
}
