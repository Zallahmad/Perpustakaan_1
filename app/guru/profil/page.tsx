'use client'

import { useState, useEffect } from 'react'
import GuruLayout from '@/components/GuruLayout'
import { createClient } from '@/lib/supabase'
import { Member } from '@/types'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Loader2,
  Save
} from 'lucide-react'

export default function ProfilPage() {
  const supabase = createClient()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    fetchMember()
  }, [])

  async function fetchMember() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error) throw error
      setMember(data)
      if (data) {
        setFormData({
          full_name: data.full_name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        })
      }
    } catch (error) {
      console.error('Error fetching member:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('members')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
        })
        .eq('id', member?.id)

      if (error) throw error

      setEditing(false)
      fetchMember()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <GuruLayout title="Profil" subtitle="Informasi akun Anda">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </GuruLayout>
    )
  }

  if (!member) {
    return (
      <GuruLayout title="Profil" subtitle="Informasi akun Anda">
        <div className="empty-state">
          <User className="empty-state-icon" />
          <h3 className="empty-state-title">Data tidak ditemukan</h3>
          <p className="empty-state-description">
            Hubungi administrator
          </p>
        </div>
      </GuruLayout>
    )
  }

  return (
    <GuruLayout title="Profil" subtitle="Informasi akun Anda">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-secondary-900">Informasi Pribadi</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-outline text-sm"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="card-body space-y-4">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input bg-secondary-50"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Email tidak dapat diubah
                </p>
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
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      full_name: member.full_name,
                      email: member.email || '',
                      phone: member.phone || '',
                      address: member.address || '',
                    })
                  }}
                  className="btn-outline flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Save className="w-4 h-4 mr-2" />Simpan</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="card-body space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
                  {member.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">{member.full_name}</h2>
                  <p className="text-sm text-secondary-500 capitalize">{member.member_type}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Email</p>
                    <p className="font-medium text-secondary-900">{member.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">No. Telepon</p>
                    <p className="font-medium text-secondary-900">{member.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">No. Anggota</p>
                    <p className="font-mono font-medium text-secondary-900">{member.member_number}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">NIS/NIP</p>
                    <p className="font-mono font-medium text-secondary-900">{member.nis_nip || '-'}</p>
                  </div>
                </div>

                {member.class && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-secondary-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-secondary-500">Kelas</p>
                      <p className="font-medium text-secondary-900">{member.class}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Alamat</p>
                    <p className="font-medium text-secondary-900">{member.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </GuruLayout>
  )
}
