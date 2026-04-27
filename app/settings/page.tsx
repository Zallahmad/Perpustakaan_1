'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { Building2, School, MapPin, Phone, Mail, Save, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    library_name: '',
    school_name: '',
    address: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setSettings({
          library_name: data.library_name || '',
          school_name: data.school_name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // First, check if settings exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .single()

      let error
      if (existingSettings) {
        // Update existing settings
        const result = await supabase
          .from('settings')
          .update(settings)
          .eq('id', existingSettings.id)
        error = result.error
      } else {
        // Insert new settings
        const result = await supabase
          .from('settings')
          .insert(settings)
        error = result.error
      }

      if (error) throw error
      alert('Pengaturan berhasil disimpan')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Gagal menyimpan pengaturan: ' + (error as any).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Pengaturan" subtitle="Konfigurasi perpustakaan">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Pengaturan" subtitle="Konfigurasi perpustakaan">
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden">
          <div className="p-6 border-b border-secondary-100">
            <h3 className="font-semibold text-secondary-900">Informasi Perpustakaan</h3>
            <p className="text-sm text-secondary-500 mt-1">
              Konfigurasi nama perpustakaan dan sekolah yang akan tercetak pada kartu member
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Library Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Nama Perpustakaan
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  value={settings.library_name}
                  onChange={(e) => setSettings({ ...settings, library_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Contoh: Perpustakaan SMA Negeri 1 Jakarta"
                  required
                />
              </div>
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Nama Sekolah
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  value={settings.school_name}
                  onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Alamat
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-secondary-400" />
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                  placeholder="Alamat perpustakaan"
                  rows={3}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Contoh: 021-12345678"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Contoh: perpustakaan@sekolah.sch.id"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-secondary-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
