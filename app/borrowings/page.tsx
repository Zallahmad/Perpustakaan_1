'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { Borrowing, Book, Member } from '@/types'
import { 
  Plus, 
  Search, 
  CheckCircle2,
  X,
  Loader2,
  BookOpen,
  User,
  AlertCircle,
  RotateCcw
} from 'lucide-react'
import { formatDate, formatCurrency, calculateFine, calculateDaysOverdue, getStatusColor, getStatusLabel } from '@/lib/utils'

interface BorrowingWithRelations extends Borrowing {
  member?: Member
  book?: Book
}

export default function BorrowingsPage() {
  const supabase = createClient()
  const [borrowings, setBorrowings] = useState<BorrowingWithRelations[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [returningId, setReturningId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    member_id: '',
    book_id: '',
    due_date: '',
    notes: '',
  })

  useEffect(() => {
    fetchBorrowings()
    fetchBooks()
    fetchMembers()
  }, [])

  async function fetchBorrowings() {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select('*, member:members(*), book:books(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBorrowings(data || [])
    } catch (error) {
      console.error('Error fetching borrowings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchBooks() {
    const { data } = await supabase
      .from('books')
      .select('*')
      .gt('available_stock', 0)
      .order('title')
    setBooks(data || [])
  }

  async function fetchMembers() {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('is_active', true)
      .order('full_name')
    setMembers(data || [])
  }

  function handleAdd() {
    // Set default due date to 7 days from now
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 7)
    
    setFormData({
      member_id: '',
      book_id: '',
      due_date: defaultDueDate.toISOString().split('T')[0],
      notes: '',
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase.from('borrowings').insert({
        member_id: formData.member_id,
        book_id: formData.book_id,
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: formData.due_date,
        notes: formData.notes || null,
        borrowed_by: user?.id,
        status: 'dipinjam',
      })

      if (error) throw error

      // Update book available stock
      const selectedBook = books.find(b => b.id === formData.book_id)
      if (selectedBook) {
        await supabase
          .from('books')
          .update({ available_stock: selectedBook.available_stock - 1 })
          .eq('id', formData.book_id)
      }

      setIsModalOpen(false)
      fetchBorrowings()
      fetchBooks()
    } catch (error: any) {
      console.error('Error saving borrowing:', error)
      alert(error.message || 'Gagal menyimpan peminjaman')
    } finally {
      setSaving(false)
    }
  }

  async function handleReturn(borrowing: BorrowingWithRelations) {
    setReturningId(borrowing.id)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const isOverdue = new Date(borrowing.due_date) < new Date()
      const fineAmount = isOverdue ? calculateFine(borrowing.due_date) : 0

      // Update borrowing
      const { error: updateError } = await supabase
        .from('borrowings')
        .update({
          return_date: new Date().toISOString().split('T')[0],
          status: isOverdue ? 'terlambat' : 'kembali',
          returned_by: user?.id,
        })
        .eq('id', borrowing.id)

      if (updateError) throw updateError

      // Create fine if overdue
      if (fineAmount > 0) {
        await supabase.from('fines').insert({
          borrowing_id: borrowing.id,
          amount: fineAmount,
          paid_amount: 0,
          is_paid: false,
        })
      }

      // Update book stock
      await supabase
        .from('books')
        .update({ available_stock: (borrowing.book?.available_stock || 0) + 1 })
        .eq('id', borrowing.book_id)

      fetchBorrowings()
    } catch (error) {
      console.error('Error returning book:', error)
      alert('Gagal mengembalikan buku')
    } finally {
      setReturningId(null)
    }
  }

  const filteredBorrowings = borrowings.filter(borrowing =>
    borrowing.borrowing_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    borrowing.member?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    borrowing.book?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeBorrowings = filteredBorrowings.filter(b => b.status === 'dipinjam')
  const returnedBorrowings = filteredBorrowings.filter(b => b.status !== 'dipinjam')

  return (
    <DashboardLayout title="Peminjaman" subtitle="Kelola peminjaman buku">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari peminjaman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full sm:w-80"
            />
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Peminjaman
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-secondary-200">
        <button className="px-4 py-2 border-b-2 border-primary-500 text-primary-600 font-medium">
          Aktif ({activeBorrowings.length})
        </button>
        <button className="px-4 py-2 border-b-2 border-transparent text-secondary-500 hover:text-secondary-700">
          Riwayat ({returnedBorrowings.length})
        </button>
      </div>

      {/* Borrowings Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredBorrowings.length === 0 ? (
        <div className="empty-state">
          <RotateCcw className="empty-state-icon" />
          <h3 className="empty-state-title">Belum ada peminjaman</h3>
          <p className="empty-state-description">
            {searchQuery ? 'Tidak ada peminjaman yang sesuai' : 'Mulai tambahkan peminjaman baru'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No. Peminjaman</th>
                <th>Member</th>
                <th>Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBorrowings.map((borrowing) => {
                const isOverdue = borrowing.status === 'dipinjam' && 
                  new Date(borrowing.due_date) < new Date()
                
                return (
                  <tr key={borrowing.id}>
                    <td className="font-medium">{borrowing.borrowing_number}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <span>{borrowing.member?.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-10 bg-secondary-100 rounded flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-secondary-400" />
                        </div>
                        <span className="truncate max-w-[150px]">{borrowing.book?.title}</span>
                      </div>
                    </td>
                    <td>{formatDate(borrowing.borrow_date)}</td>
                    <td>
                      <div>
                        {formatDate(borrowing.due_date)}
                        {isOverdue && (
                          <p className="text-xs text-danger-600">
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
                    <td>
                      <div className="flex justify-end">
                        {borrowing.status === 'dipinjam' && (
                          <button
                            onClick={() => handleReturn(borrowing)}
                            disabled={returningId === borrowing.id}
                            className="btn-success py-1.5 px-3 text-sm"
                          >
                            {returningId === borrowing.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Kembalikan
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-panel">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold text-secondary-900">Tambah Peminjaman</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary-100"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="card-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Member *</label>
                  <select
                    required
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    className="select"
                  >
                    <option value="">Pilih Member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name} ({member.member_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Buku *</label>
                  <select
                    required
                    value={formData.book_id}
                    onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                    className="select"
                  >
                    <option value="">Pilih Buku</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} - Stok: {book.available_stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Jatuh Tempo *</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="textarea"
                  />
                </div>
              </form>

              <div className="card-footer flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
