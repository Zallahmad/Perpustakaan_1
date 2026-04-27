'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { Member } from '@/types'
import { 
  QrCode, 
  Search, 
  User,
  CreditCard,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { formatDate, getInitials } from '@/lib/utils'
import Link from 'next/link'

export default function ScanPage() {
  const supabase = createClient()
  const [memberNumber, setMemberNumber] = useState('')
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanned, setScanned] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!memberNumber.trim()) return

    setLoading(true)
    setError('')
    setMember(null)
    setScanned(false)

    try {
      // Parse QR code format: LIB:MBR-YYYY-XXXX or just MBR-YYYY-XXXX
      let searchNumber = memberNumber.trim()
      if (searchNumber.startsWith('LIB:')) {
        searchNumber = searchNumber.replace('LIB:', '')
      }

      const { data, error: supabaseError } = await supabase
        .from('members')
        .select('*')
        .eq('member_number', searchNumber)
        .single()

      if (supabaseError) throw supabaseError

      if (data) {
        setMember(data)
        setScanned(true)
      } else {
        setError('Member tidak ditemukan')
      }
    } catch (err) {
      setError('Member tidak ditemukan')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setMemberNumber('')
    setMember(null)
    setError('')
    setScanned(false)
  }

  return (
    <DashboardLayout title="Scan QR Code" subtitle="Verifikasi member perpustakaan">
      <div className="max-w-2xl mx-auto">
        {/* Input Section */}
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="font-semibold text-secondary-900">Input Kode Member</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(e.target.value)}
                  placeholder="Scan atau masukkan nomor member (contoh: MBR-2024-0001)"
                  className="input pl-12 text-lg"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !memberNumber.trim()}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Cari Member
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  Reset
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-danger-50 text-danger-600">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Result Section */}
        {scanned && member && (
          <div className="card border-2 border-success-200">
            <div className="card-header bg-success-50 border-success-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-600" />
                <h3 className="font-semibold text-success-900">Member Ditemukan</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mb-4">
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
                <p className="text-secondary-500">{member.member_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-xs text-secondary-500 mb-1">Tipe</p>
                  <p className="font-medium text-secondary-900 capitalize">{member.member_type}</p>
                </div>
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-xs text-secondary-500 mb-1">Status</p>
                  <span className={`badge ${member.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {member.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {member.nis_nip && (
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <p className="text-xs text-secondary-500 mb-1">NIS/NIP</p>
                    <p className="font-medium text-secondary-900">{member.nis_nip}</p>
                  </div>
                )}
                {member.class && (
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <p className="text-xs text-secondary-500 mb-1">Kelas</p>
                    <p className="font-medium text-secondary-900">{member.class}</p>
                  </div>
                )}
                {member.email && (
                  <div className="p-3 bg-secondary-50 rounded-lg col-span-2">
                    <p className="text-xs text-secondary-500 mb-1">Email</p>
                    <p className="font-medium text-secondary-900">{member.email}</p>
                  </div>
                )}
                <div className="p-3 bg-secondary-50 rounded-lg col-span-2">
                  <p className="text-xs text-secondary-500 mb-1">Tanggal Daftar</p>
                  <p className="font-medium text-secondary-900">{formatDate(member.created_at || '')}</p>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-secondary-200">
                  <QRCodeSVG 
                    value={`LIB:${member.member_number}`}
                    size={120}
                    level="M"
                  />
                  <p className="text-xs text-center text-secondary-500 mt-2">
                    {member.member_number}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/members/${member.id}`}
                  className="btn-primary flex-1 text-center"
                >
                  <User className="w-4 h-4 mr-2 inline" />
                  Lihat Detail
                </Link>
                <Link
                  href={`/members/${member.id}/card`}
                  className="btn-secondary"
                >
                  <CreditCard className="w-4 h-4 mr-2 inline" />
                  Kartu
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!scanned && !error && (
          <div className="card bg-secondary-50 border-dashed border-2 border-secondary-200">
            <div className="card-body text-center">
              <QrCode className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <h3 className="font-medium text-secondary-900 mb-2">Cara Penggunaan</h3>
              <ul className="text-sm text-secondary-500 space-y-1">
                <li>Masukkan nomor member atau scan QR code</li>
                <li>Format: MBR-YYYY-XXXX (contoh: MBR-2024-0001)</li>
                <li>Data member akan ditampilkan setelah ditemukan</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
