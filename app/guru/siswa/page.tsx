'use client'

import { useState, useEffect } from 'react'
import GuruLayout from '@/components/GuruLayout'
import { createClient } from '@/lib/supabase'
import { Member, MemberType } from '@/types'
import { 
  Plus, 
  Search, 
  Users,
  X,
  Loader2,
  Download,
  QrCode,
  Mail,
  Phone,
  CreditCard,
  GraduationCap,
  User
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

interface MemberFormData {
  full_name: string
  email: string
  password: string
  phone: string
  member_type: MemberType
  nis_nip: string
  class: string
  address: string
}

export default function SiswaSayaPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<MemberFormData>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    member_type: 'siswa',
    nis_nip: '',
    class: '',
    address: '',
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('member_type', 'siswa')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleAdd() {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      member_type: 'siswa',
      nis_nip: '',
      class: '',
      address: '',
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      console.log('Creating student:', formData)
      
      // Create auth user - API will also create member record automatically
      const response = await fetch('/api/members/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          member_type: formData.member_type,
          nis_nip: formData.nis_nip,
          class: formData.class,
          phone: formData.phone,
          address: formData.address,
        }),
      })

      const result = await response.json()
      console.log('API response:', result)

      if (!response.ok) {
        // Translate common errors
        let errorMsg = result.error || 'Gagal membuat user auth'
        if (errorMsg.includes('email address has already been registered')) {
          errorMsg = 'Email sudah terdaftar. Gunakan email lain.'
        }
        throw new Error(errorMsg)
      }

      // Member record is auto-created by API, just close modal and refresh
      setIsModalOpen(false)
      fetchStudents()
    } catch (error: any) {
      console.error('Error saving student:', error)
      alert('Gagal menyimpan siswa: ' + (error.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.member_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nis_nip?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function downloadStudentCard(student: Member) {
    // Create a canvas to generate the card image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Card dimensions
    canvas.width = 600
    canvas.height = 350

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 350)
    gradient.addColorStop(0, '#4F46E5')
    gradient.addColorStop(1, '#3730A3')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 350)

    // Card border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, 580, 330)

    // Header
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.fillText('KARTU ANGGOTA PERPUSTAKAAN', 30, 50)

    // School name
    ctx.font = '16px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('SEKOLAH DASAR', 30, 75)

    // Student info
    ctx.fillStyle = 'white'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(student.full_name, 30, 120)

    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`No. Anggota: ${student.member_number}`, 30, 150)
    
    if (student.nis_nip) {
      ctx.fillText(`NIS: ${student.nis_nip}`, 30, 175)
    }
    
    if (student.class) {
      ctx.fillText(`Kelas: ${student.class}`, 30, 200)
    }

    // Validity
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '12px Arial'
    ctx.fillText('Berlaku: Seumur Hidup', 30, 250)

    // Draw QR code placeholder or actual QR
    if (student.qr_code) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 420, 100, 150, 150)
        
        // Download the card
        const link = document.createElement('a')
        link.download = `kartu-${student.member_number}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      img.src = student.qr_code
    } else {
      // No QR code, download directly
      const link = document.createElement('a')
      link.download = `kartu-${student.member_number}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <GuruLayout title="Siswa Saya" subtitle="Kelola data siswa">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Cari siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Siswa
        </button>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <h3 className="empty-state-title">Belum ada siswa</h3>
          <p className="empty-state-description">
            {searchQuery ? 'Tidak ada siswa yang sesuai' : 'Mulai tambahkan siswa'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              {/* Decorative Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-500/10 to-secondary-600/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

              {/* Card Header - Modern Gradient */}
              <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-6 text-white">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}></div>
                </div>
                
                <div className="relative flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold border-2 border-white/30 shadow-xl overflow-hidden">
                      {student.photo_url ? (
                        <img 
                          src={student.photo_url} 
                          alt={student.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{getInitials(student.full_name)}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl truncate">{student.full_name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-white/90">
                      <CreditCard className="w-4 h-4" />
                      <p className="text-sm font-mono">{student.member_number}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium backdrop-blur-sm">
                        <User className="w-3 h-3" />
                        Aktif
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body - Modern Info Grid */}
              <div className="relative p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {student.nis_nip && (
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-3 rounded-xl border border-primary-100">
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-primary-600" />
                        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide">NIS</p>
                      </div>
                      <p className="font-bold text-secondary-900 text-sm truncate">{student.nis_nip}</p>
                    </div>
                  )}
                  
                  {student.class && (
                    <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 p-3 rounded-xl border border-secondary-100">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-secondary-600" />
                        <p className="text-xs text-secondary-600 font-semibold uppercase tracking-wide">Kelas</p>
                      </div>
                      <p className="font-bold text-secondary-900 text-sm">{student.class}</p>
                    </div>
                  )}
                </div>

                {student.email && (
                  <div className="bg-gradient-to-r from-secondary-50 to-white p-3 rounded-xl border border-secondary-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-secondary-500 font-semibold uppercase tracking-wide">Email</p>
                        <p className="font-medium text-secondary-900 text-sm truncate">{student.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {student.phone && (
                  <div className="bg-gradient-to-r from-secondary-50 to-white p-3 rounded-xl border border-secondary-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-secondary-500 font-semibold uppercase tracking-wide">Telepon</p>
                        <p className="font-medium text-secondary-900 text-sm">{student.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Section - Modern Design */}
              {student.qr_code && (
                <div className="relative px-5 pb-4">
                  <div className="bg-gradient-to-br from-secondary-50 via-white to-primary-50 rounded-2xl p-5 border border-secondary-200 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
                          <QrCode className="w-3 h-3 text-primary-600" />
                        </div>
                        <p className="text-xs font-bold text-secondary-700 uppercase tracking-wide">QR Code</p>
                      </div>
                      <span className="text-xs text-secondary-400">ID Card</span>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-secondary-100 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5"></div>
                      <img 
                        src={student.qr_code} 
                        alt="QR Code" 
                        className="w-28 h-28 relative z-10"
                      />
                    </div>
                    <p className="text-xs text-secondary-500 text-center mt-3 font-medium">
                      Scan untuk identifikasi
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button - Modern */}
              <div className="relative p-5 pt-0">
                <button
                  onClick={() => downloadStudentCard(student)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  Download Kartu Siswa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Tambah Siswa</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">NIS</label>
                  <input
                    type="text"
                    value={formData.nis_nip}
                    onChange={(e) => setFormData({ ...formData, nis_nip: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kelas</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  )
}
