'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { Member, MemberType } from '@/types'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users,
  X,
  Loader2,
  QrCode,
  Download,
  Eye,
  Image as ImageIcon,
  CreditCard,
  Printer
} from 'lucide-react'
import { formatDate, generateQRCodeData, getInitials } from '@/lib/utils'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'

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

export default function MembersPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    library_name: 'Perpustakaan',
    school_name: 'Sekolah'
  })

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

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    fetchMembers()
    fetchSettings()
  }, [])

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setSettings({
          library_name: data.library_name || 'Perpustakaan',
          school_name: data.school_name || 'Sekolah'
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  function handleEdit(member: Member) {
    setEditingMember(member)
    setFormData({
      full_name: member.full_name,
      email: member.email || '',
      password: '', // Don't show password on edit
      phone: member.phone || '',
      member_type: member.member_type,
      nis_nip: member.nis_nip || '',
      class: member.class || '',
      address: member.address || '',
    })
    setPhotoPreview(member.photo_url || '')
    setIsModalOpen(true)
  }

  function handleAdd() {
    setEditingMember(null)
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
    setPhotoFile(null)
    setPhotoPreview('')
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let photoUrl = editingMember?.photo_url || ''
      let userId = editingMember?.user_id || null

      console.log('Starting member save, editingMember:', editingMember)
      console.log('Form data:', formData)

      // Create auth user if adding new member with password
      if (!editingMember && formData.password) {
        console.log('Creating auth user for:', formData.email)
        
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
        console.log('Auth user creation response:', result)
        console.log('Response status:', response.status, response.statusText)

        if (!response.ok) {
          console.error('API Error:', result.error)
          // Translate common errors to Indonesian
          let errorMsg = result.error || `Gagal membuat user auth (${response.status})`
          if (errorMsg.includes('email address has already been registered')) {
            errorMsg = 'Email sudah terdaftar. Gunakan email lain atau hapus user lama terlebih dahulu.'
          }
          throw new Error(errorMsg)
        }

        // Member record is auto-created by API, so just close modal and refresh
        setIsModalOpen(false)
        fetchMembers()
        setSaving(false)
        return
      }

      // Upload photo if selected
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `member-photos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('library-assets')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Gagal upload foto: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('library-assets')
          .getPublicUrl(filePath)

        photoUrl = publicUrl
      }

      const memberData = {
        user_id: userId,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        member_type: formData.member_type,
        nis_nip: formData.nis_nip || null,
        class: formData.class || null,
        address: formData.address || null,
        photo_url: photoUrl || null,
      }

      console.log('Saving member data:', memberData)

      if (editingMember) {
        const { error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', editingMember.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('members')
          .insert(memberData)

        if (error) throw error
      }

      setIsModalOpen(false)
      fetchMembers()
    } catch (error) {
      console.error('Error saving member:', error)
      alert('Gagal menyimpan member')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus member ini?')) return

    try {
      console.log('Starting delete for member id:', id)
      
      // Get member data first to get user_id
      const { data: member, error: fetchError } = await supabase
        .from('members')
        .select('user_id, full_name')
        .eq('id', id)
        .maybeSingle()
      
      console.log('Member data:', member, 'Fetch error:', fetchError)

      if (fetchError) {
        throw new Error('Gagal mengambil data member: ' + fetchError.message)
      }

      if (!member) {
        throw new Error('Member tidak ditemukan')
      }

      console.log('Deleting member:', member.full_name, 'user_id:', member.user_id)

      // Delete from members table first
      const { error: memberError, data: deleteData } = await supabase
        .from('members')
        .delete()
        .eq('id', id)
        .select()

      console.log('Delete result:', deleteData, 'Error:', memberError)

      if (memberError) {
        throw new Error('Gagal menghapus member: ' + memberError.message)
      }

      // Delete from user_roles if user_id exists
      if (member?.user_id) {
        console.log('Deleting user_roles for user_id:', member.user_id)
        const { error: roleError, data: roleDeleteData } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', member.user_id)
          .select()

        console.log('Role delete result:', roleDeleteData, 'Error:', roleError)

        if (roleError) {
          console.error('Error deleting user role:', roleError)
        }
      }

      console.log('Delete completed successfully')
      fetchMembers()
    } catch (error: any) {
      console.error('Error deleting member:', error)
      alert('Gagal menghapus member: ' + (error.message || 'Unknown error'))
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Compress image before processing
      const options = {
        maxSizeMB: 0.5, // Max 500KB
        maxWidthOrHeight: 800, // Max dimension
        useWebWorker: true,
      }
      
      const compressedFile = await imageCompression(file, options)
      setPhotoFile(compressedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error compressing image:', error)
      // Fallback to original if compression fails
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredMembers = members.filter(member =>
    (member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.member_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.nis_nip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedType === '' || member.member_type === selectedType)
  )

  function downloadCard(member: Member) {
    // Create a canvas to generate the card image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Card dimensions
    canvas.width = 600
    canvas.height = 350

    // Background gradient based on member type
    const gradient = ctx.createLinearGradient(0, 0, 600, 350)
    if (member.member_type === 'guru') {
      gradient.addColorStop(0, '#4F46E5')
      gradient.addColorStop(1, '#3730A3')
    } else if (member.member_type === 'karyawan') {
      gradient.addColorStop(0, '#059669')
      gradient.addColorStop(1, '#047857')
    } else {
      gradient.addColorStop(0, '#0EA5E9')
      gradient.addColorStop(1, '#0284C7')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 350)

    // Card border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, 580, 330)

    // Header
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`KARTU ANGGOTA ${settings.library_name.toUpperCase()}`, 30, 50)

    // School name
    ctx.font = '16px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(settings.school_name.toUpperCase(), 30, 75)

    // Member info
    ctx.fillStyle = 'white'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(member.full_name, 30, 120)

    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`No. Anggota: ${member.member_number}`, 30, 150)
    
    if (member.nis_nip) {
      ctx.fillText(`NIS/NIP: ${member.nis_nip}`, 30, 175)
    }
    
    if (member.class) {
      ctx.fillText(`Kelas: ${member.class}`, 30, 200)
    }
    
    ctx.fillText(`Tipe: ${member.member_type.toUpperCase()}`, 30, 225)

    // Validity
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '12px Arial'
    ctx.fillText('Berlaku: Seumur Hidup', 30, 275)

    // Draw QR code if available
    if (member.qr_code) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 420, 100, 150, 150)
        
        // Download the card
        const link = document.createElement('a')
        link.download = `kartu-${member.member_type}-${member.member_number}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      img.src = member.qr_code
    } else {
      // No QR code, download directly
      const link = document.createElement('a')
      link.download = `kartu-${member.member_type}-${member.member_number}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  function printCard(member: Member) {
    // Create a canvas to generate the card image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Card dimensions
    canvas.width = 600
    canvas.height = 350

    // Background gradient based on member type
    const gradient = ctx.createLinearGradient(0, 0, 600, 350)
    if (member.member_type === 'guru') {
      gradient.addColorStop(0, '#4F46E5')
      gradient.addColorStop(1, '#3730A3')
    } else if (member.member_type === 'karyawan') {
      gradient.addColorStop(0, '#059669')
      gradient.addColorStop(1, '#047857')
    } else {
      gradient.addColorStop(0, '#0EA5E9')
      gradient.addColorStop(1, '#0284C7')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 350)

    // Card border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, 580, 330)

    // Header
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`KARTU ANGGOTA ${settings.library_name.toUpperCase()}`, 30, 50)

    // School name
    ctx.font = '16px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(settings.school_name.toUpperCase(), 30, 75)

    // Member info
    ctx.fillStyle = 'white'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(member.full_name, 30, 120)

    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`No. Anggota: ${member.member_number}`, 30, 150)
    
    if (member.nis_nip) {
      ctx.fillText(`NIS/NIP: ${member.nis_nip}`, 30, 175)
    }
    
    if (member.class) {
      ctx.fillText(`Kelas: ${member.class}`, 30, 200)
    }
    
    ctx.fillText(`Tipe: ${member.member_type.toUpperCase()}`, 30, 225)

    // Validity
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '12px Arial'
    ctx.fillText('Berlaku: Seumur Hidup', 30, 275)

    // Draw QR code if available
    if (member.qr_code) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 420, 100, 150, 150)
        
        // Print the card
        const dataUrl = canvas.toDataURL()
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Cetak Kartu Member</title>
                <style>
                  @page { margin: 0; }
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                  img { max-width: 100%; }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" onload="window.print(); window.close();" />
              </body>
            </html>
          `)
        }
      }
      img.src = member.qr_code
    } else {
      // No QR code, print directly
      const dataUrl = canvas.toDataURL()
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cetak Kartu Member</title>
              <style>
                @page { margin: 0; }
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.print(); window.close();" />
            </body>
          </html>
        `)
      }
    }
  }

  return (
    <DashboardLayout title="Manajemen Member" subtitle="Kelola data member perpustakaan">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full sm:w-80"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="select w-full sm:w-40"
          >
            <option value="">Semua Tipe</option>
            <option value="siswa">Siswa</option>
            <option value="guru">Guru</option>
            <option value="karyawan">Karyawan</option>
          </select>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Member
        </button>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <h3 className="empty-state-title">Belum ada member</h3>
          <p className="empty-state-description">
            {searchQuery ? 'Tidak ada member yang sesuai dengan pencarian' : 'Mulai tambahkan member perpustakaan'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Nomor Member</th>
                <th>NIS/NIP</th>
                <th>Kelas</th>
                <th>Tipe</th>
                <th>Tanggal Daftar</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-primary-700">
                            {getInitials(member.full_name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{member.full_name}</p>
                        <p className="text-sm text-secondary-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{member.member_number}</span>
                  </td>
                  <td>{member.nis_nip || '-'}</td>
                  <td>{member.class || '-'}</td>
                  <td>
                    <span className="badge badge-secondary capitalize">
                      {member.member_type}
                    </span>
                  </td>
                  <td>{formatDate(member.created_at || '')}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/members/${member.id}`}
                        className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => downloadCard(member)}
                        className="p-2 rounded-lg text-primary-600 hover:bg-primary-50"
                        title="Download Kartu"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => printCard(member)}
                        className="p-2 rounded-lg text-primary-600 hover:bg-primary-50"
                        title="Cetak Kartu"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 rounded-lg text-danger-600 hover:bg-danger-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                <h3 className="font-semibold text-secondary-900">
                  {editingMember ? 'Edit Member' : 'Tambah Member'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary-100"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="card-body space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Photo Upload */}
                <div className="form-group">
                  <label className="form-label">Foto Member</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-secondary-300">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-secondary-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="btn-outline text-sm inline-flex cursor-pointer"
                      >
                        {photoPreview ? 'Ganti Foto' : 'Pilih Foto'}
                      </label>
                      <p className="text-xs text-secondary-500 mt-2">
                        Format: JPG, PNG. Maks: 2MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      required={!editingMember}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Password {!editingMember ? '*' : '(kosongkan jika tidak diubah)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      required={!editingMember}
                      placeholder={editingMember ? 'Biarkan kosong jika tidak ingin mengubah' : 'Masukkan password'}
                    />
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
                    <label className="form-label">Tipe Member *</label>
                    <select
                      required
                      value={formData.member_type}
                      onChange={(e) => setFormData({ ...formData, member_type: e.target.value as MemberType })}
                      className="select"
                    >
                      <option value="siswa">Siswa</option>
                      <option value="guru">Guru</option>
                      <option value="karyawan">Karyawan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">NIS/NIP</label>
                    <input
                      type="text"
                      value={formData.nis_nip}
                      onChange={(e) => setFormData({ ...formData, nis_nip: e.target.value })}
                      className="input"
                      placeholder={formData.member_type === 'guru' ? 'NIP Guru' : 'NIS Siswa'}
                    />
                  </div>

                  {formData.member_type === 'siswa' && (
                    <div className="form-group">
                      <label className="form-label">Kelas</label>
                      <input
                        type="text"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        className="input"
                        placeholder="Contoh: X IPA 1"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="textarea"
                  />
                </div>
              </form>

              <div className="card-footer flex justify-end gap-3">
                <button
                  type="button"
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
