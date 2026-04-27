'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { Member } from '@/types'
import { 
  ArrowLeft, 
  Download, 
  Printer,
  QrCode,
  Loader2
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { formatDate, getInitials } from '@/lib/utils'

export default function MemberCardPage() {
  const supabase = createClient()
  const params = useParams()
  const memberId = params.id as string
  const cardRef = useRef<HTMLDivElement>(null)
  
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (memberId) {
      fetchMember()
    }
  }, [memberId])

  async function fetchMember() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single()

      if (error) throw error
      setMember(data)
    } catch (error) {
      console.error('Error fetching member:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleDownload() {
    // In a real implementation, you would use html2canvas or similar
    // to convert the card to an image and download it
    alert('Fitur download akan mengkonversi kartu ke format gambar/PDF')
  }

  if (loading) {
    return (
      <DashboardLayout title="Kartu Member" subtitle="Memuat data...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!member) {
    return (
      <DashboardLayout title="Kartu Member" subtitle="">
        <div className="text-center py-12">
          <p className="text-secondary-500">Member tidak ditemukan</p>
        </div>
      </DashboardLayout>
    )
  }

  const qrData = `LIB:${member.member_number}`

  return (
    <DashboardLayout title="Kartu Member" subtitle={member.full_name}>
      {/* Back Button */}
      <div className="mb-6 no-print">
        <Link
          href={`/members/${member.id}`}
          className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Detail Member
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-8 no-print">
        <button onClick={handlePrint} className="btn-primary">
          <Printer className="w-4 h-4 mr-2" />
          Cetak
        </button>
        <button onClick={handleDownload} className="btn-secondary">
          <Download className="w-4 h-4 mr-2" />
          Download
        </button>
      </div>

      {/* Card Preview */}
      <div className="flex justify-center">
        <div 
          ref={cardRef}
          className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none"
          style={{ width: '340px', minHeight: '200px' }}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Perpustakaan Sekolah</h3>
                <p className="text-xs text-primary-100">Kartu Anggota</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5">
            <div className="flex gap-4">
              {/* Photo */}
              <div className="w-20 h-24 rounded-lg bg-secondary-100 flex-shrink-0 overflow-hidden">
                {member.photo_url ? (
                  <img 
                    src={member.photo_url} 
                    alt={member.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl font-bold text-secondary-400">
                      {getInitials(member.full_name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-secondary-900 text-base truncate">
                  {member.full_name}
                </h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-secondary-600">
                    <span className="text-secondary-400">No:</span>{' '}
                    <span className="font-mono font-medium">{member.member_number}</span>
                  </p>
                  {member.nis_nip && (
                    <p className="text-secondary-600">
                      <span className="text-secondary-400">NIS/NIP:</span>{' '}
                      <span className="font-medium">{member.nis_nip}</span>
                    </p>
                  )}
                  {member.class && (
                    <p className="text-secondary-600">
                      <span className="text-secondary-400">Kelas:</span>{' '}
                      <span className="font-medium">{member.class}</span>
                    </p>
                  )}
                  <p className="text-secondary-600">
                    <span className="text-secondary-400">Tipe:</span>{' '}
                    <span className="badge badge-primary capitalize text-xs">
                      {member.member_type}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-4 pt-4 border-t border-secondary-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-secondary-400">
                  <p>Scan untuk verifikasi</p>
                  <p>Terdaftar: {formatDate(member.created_at || '')}</p>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG 
                    value={qrData} 
                    size={60}
                    level="M"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-secondary-50 px-4 py-2 text-center">
            <p className="text-xs text-secondary-500">
              Kartu ini adalah milik Perpustakaan Sekolah
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
