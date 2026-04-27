'use client'

import { useState, useEffect } from 'react'
import GuruLayout from '@/components/GuruLayout'
import { createClient } from '@/lib/supabase'
import { Member } from '@/types'
import { 
  CreditCard,
  Download,
  Printer,
  QrCode,
  Loader2,
  BookOpen,
  User
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

export default function KartuMemberPage() {
  const supabase = createClient()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      } catch (error) {
        console.error('Error fetching member:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [supabase])

  function downloadCard() {
    if (!member) return
    
    // Create a canvas to generate the card image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Card dimensions
    canvas.width = 600
    canvas.height = 350

    // Background gradient (purple for teacher)
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

    // Member info
    ctx.fillStyle = 'white'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(member.full_name, 30, 120)

    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`No. Anggota: ${member.member_number}`, 30, 150)
    
    if (member.nis_nip) {
      ctx.fillText(`NIP: ${member.nis_nip}`, 30, 175)
    }
    
    ctx.fillText(`Tipe: ${member.member_type.toUpperCase()}`, 30, 200)

    // Validity
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '12px Arial'
    ctx.fillText('Berlaku: Seumur Hidup', 30, 250)

    // Draw QR code placeholder or actual QR
    if (member.qr_code) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 420, 100, 150, 150)
        
        // Download the card
        const link = document.createElement('a')
        link.download = `kartu-guru-${member.member_number}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      img.src = member.qr_code
    } else {
      // No QR code, download directly
      const link = document.createElement('a')
      link.download = `kartu-guru-${member.member_number}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  function printCard() {
    if (!member) return
    
    // Create a canvas to generate the card image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Card dimensions
    canvas.width = 600
    canvas.height = 350

    // Background gradient (purple for teacher)
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

    // Member info
    ctx.fillStyle = 'white'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(member.full_name, 30, 120)

    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`No. Anggota: ${member.member_number}`, 30, 150)
    
    if (member.nis_nip) {
      ctx.fillText(`NIP: ${member.nis_nip}`, 30, 175)
    }
    
    ctx.fillText(`Tipe: ${member.member_type.toUpperCase()}`, 30, 200)

    // Validity
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '12px Arial'
    ctx.fillText('Berlaku: Seumur Hidup', 30, 250)

    // Draw QR code placeholder or actual QR
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

  if (loading) {
    return (
      <GuruLayout title="Kartu Member" subtitle="Kartu identitas perpustakaan">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </GuruLayout>
    )
  }

  if (!member) {
    return (
      <GuruLayout title="Kartu Member" subtitle="Kartu identitas perpustakaan">
        <div className="empty-state">
          <CreditCard className="empty-state-icon" />
          <h3 className="empty-state-title">Data member tidak ditemukan</h3>
          <p className="empty-state-description">
            Hubungi administrator untuk pendaftaran
          </p>
        </div>
      </GuruLayout>
    )
  }

  return (
    <GuruLayout title="Kartu Member" subtitle="Kartu identitas perpustakaan">
      <div className="max-w-md mx-auto">
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-8 text-white shadow-2xl">
          {/* Decorative Background Pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-wide">Perpustakaan Sekolah</h1>
              <p className="text-sm text-white/70 mt-1">Kartu Anggota</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <BookOpen className="w-7 h-7" />
            </div>
          </div>

          {/* Member Info */}
          <div className="relative space-y-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/30 shadow-xl overflow-hidden">
                  {member.photo_url ? (
                    <img 
                      src={member.photo_url} 
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(member.full_name)}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{member.full_name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium backdrop-blur-sm">
                    <User className="w-3 h-3" />
                    {member.member_type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs text-white/70 uppercase tracking-wide mb-1">No. Anggota</p>
                <p className="font-mono font-bold text-lg">{member.member_number}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs text-white/70 uppercase tracking-wide mb-1">NIP</p>
                <p className="font-mono font-bold text-lg">{member.nis_nip || '-'}</p>
              </div>
              {member.class && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Kelas</p>
                  <p className="font-bold text-lg">{member.class}</p>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Berlaku</p>
                <p className="font-bold text-lg">Seumur Hidup</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {member.qr_code && (
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-bold text-white uppercase tracking-wide">QR Code</p>
                </div>
                <span className="text-xs text-white/60">ID Card</span>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5"></div>
                <img src={member.qr_code} alt="QR Code" className="w-36 h-36 relative z-10" />
              </div>
              <p className="text-xs text-white/60 text-center mt-4 font-medium">
                Scan untuk identifikasi
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={downloadCard}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button 
            onClick={printCard}
            className="flex-1 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>
        </div>

        <p className="text-center text-xs text-secondary-500 mt-4">
          Tunjukkan kartu ini saat meminjam atau mengembalikan buku
        </p>
      </div>
    </GuruLayout>
  )
}
