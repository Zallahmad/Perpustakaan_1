'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { Member, Borrowing } from '@/types'
import { 
  ArrowLeft, 
  Edit2, 
  CreditCard,
  BookOpen,
  Clock,
  AlertCircle,
  User
} from 'lucide-react'
import { formatDate, getInitials, getStatusColor, getStatusLabel, formatNumber, calculateDaysOverdue } from '@/lib/utils'

export default function MemberDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const memberId = params.id as string
  
  const [member, setMember] = useState<Member | null>(null)
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (memberId) {
      fetchMemberData()
    }
  }, [memberId])

  async function fetchMemberData() {
    try {
      const [memberResponse, borrowingsResponse] = await Promise.all([
        supabase.from('members').select('*').eq('id', memberId).single(),
        supabase
          .from('borrowings')
          .select('*, book:books(title, author, cover_url)')
          .eq('member_id', memberId)
          .order('created_at', { ascending: false })
      ])

      if (memberResponse.error) throw memberResponse.error
      setMember(memberResponse.data)
      setBorrowings(borrowingsResponse.data || [])
    } catch (error) {
      console.error('Error fetching member data:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeBorrowings = borrowings.filter(b => b.status === 'dipinjam')
  const overdueBorrowings = borrowings.filter(b => 
    b.status === 'dipinjam' && new Date(b.due_date) < new Date()
  )

  if (loading) {
    return (
      <DashboardLayout title="Detail Member" subtitle="Memuat data...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!member) {
    return (
      <DashboardLayout title="Detail Member" subtitle="">
        <div className="empty-state">
          <AlertCircle className="empty-state-icon" />
          <h3 className="empty-state-title">Member tidak ditemukan</h3>
          <Link href="/members" className="btn-primary mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Member
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Detail Member" 
      subtitle={member.full_name}
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/members"
          className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Daftar Member
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mb-4">
                {member.photo_url ? (
                  <img 
                    src={member.photo_url} 
                    alt={member.full_name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-700">
                    {getInitials(member.full_name)}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-secondary-900">{member.full_name}</h2>
              <p className="text-sm text-secondary-500">{member.member_number}</p>
              
              <div className="mt-4 flex justify-center gap-2">
                <span className="badge badge-primary capitalize">{member.member_type}</span>
                <span className={`badge ${member.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {member.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-left">
                {member.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Email</p>
                      <p className="text-sm font-medium">{member.email}</p>
                    </div>
                  </div>
                )}
                
                {member.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Telepon</p>
                      <p className="text-sm font-medium">{member.phone}</p>
                    </div>
                  </div>
                )}

                {member.nis_nip && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">NIS/NIP</p>
                      <p className="text-sm font-medium">{member.nis_nip}</p>
                    </div>
                  </div>
                )}

                {member.class && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Kelas</p>
                      <p className="text-sm font-medium">{member.class}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Tanggal Daftar</p>
                    <p className="text-sm font-medium">{formatDate(member.created_at || '')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-secondary-200">
                <Link
                  href={`/members/${member.id}/card`}
                  className="btn-outline w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Lihat Kartu Member
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Borrowings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="stat-label">Total Peminjaman</p>
              <p className="stat-value">{formatNumber(borrowings.length)}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Sedang Dipinjam</p>
              <p className="stat-value text-warning-600">{formatNumber(activeBorrowings.length)}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Terlambat</p>
              <p className={`stat-value ${overdueBorrowings.length > 0 ? 'text-danger-600' : ''}`}>
                {formatNumber(overdueBorrowings.length)}
              </p>
            </div>
          </div>

          {/* Borrowings Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-secondary-900">Riwayat Peminjaman</h3>
            </div>
            
            {borrowings.length === 0 ? (
              <div className="card-body">
                <div className="empty-state py-8">
                  <BookOpen className="w-12 h-12 text-secondary-300 mb-3" />
                  <p className="text-secondary-500">Belum ada riwayat peminjaman</p>
                </div>
              </div>
            ) : (
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
                    {borrowings.map((borrowing) => {
                      const isOverdue = borrowing.status === 'dipinjam' && 
                        new Date(borrowing.due_date) < new Date()
                      
                      return (
                        <tr key={borrowing.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 bg-secondary-100 rounded overflow-hidden flex-shrink-0">
                                {borrowing.book?.cover_url ? (
                                  <img 
                                    src={borrowing.book.cover_url} 
                                    alt={borrowing.book.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="w-5 h-5 m-auto text-secondary-300" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-secondary-900 text-sm">{borrowing.book?.title}</p>
                                <p className="text-xs text-secondary-500">{borrowing.book?.author}</p>
                              </div>
                            </div>
                          </td>
                          <td>{formatDate(borrowing.borrow_date)}</td>
                          <td>
                            <div>
                              {formatDate(borrowing.due_date)}
                              {isOverdue && (
                                <p className="text-xs text-danger-600 mt-0.5">
                                  Terlambat {calculateDaysOverdue(borrowing.due_date)} hari
                                </p>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getStatusColor(borrowing.status)}`}>
                              {getStatusLabel(borrowing.status)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
