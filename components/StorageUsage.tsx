'use client'

import { useState, useEffect } from 'react'
import { HardDrive, FolderOpen, Image, Users, BookOpen } from 'lucide-react'

interface StorageData {
  totalSize: number
  totalSizeFormatted: string
  fileCount: number
  breakdown: {
    'book-covers': { size: number; formatted: string }
    'member-photos': { size: number; formatted: string }
    'ebook-covers': { size: number; formatted: string }
    'other': { size: number; formatted: string }
  }
}

export default function StorageUsage() {
  const [storageData, setStorageData] = useState<StorageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bucketExists, setBucketExists] = useState(true)

  useEffect(() => {
    async function fetchStorageUsage() {
      try {
        const response = await fetch('/api/storage/usage')
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || 'Gagal mengambil data storage')
          setBucketExists(data.bucketExists ?? true)
          return
        }
        
        setStorageData(data)
        setBucketExists(data.bucketExists ?? true)
      } catch (error) {
        console.error('Error fetching storage usage:', error)
        setError('Terjadi kesalahan saat mengambil data storage')
      } finally {
        setLoading(false)
      }
    }

    fetchStorageUsage()
  }, [])

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-secondary-900">Penggunaan Storage</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !bucketExists) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-secondary-900">Penggunaan Storage</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-3 p-4 bg-warning-50 rounded-lg">
            <HardDrive className="w-5 h-5 text-warning-600" />
            <div>
              <p className="text-sm font-medium text-warning-900">
                {!bucketExists ? 'Bucket belum dibuat' : 'Gagal mengambil data'}
              </p>
              <p className="text-xs text-warning-700">
                {!bucketExists 
                  ? 'Buat bucket "library-assets" di Supabase Storage' 
                  : error || 'Terjadi kesalahan'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const breakdownItems = [
    { key: 'book-covers', label: 'Cover Buku', icon: BookOpen, color: 'bg-primary-100 text-primary-600' },
    { key: 'member-photos', label: 'Foto Member', icon: Users, color: 'bg-success-100 text-success-600' },
    { key: 'ebook-covers', label: 'Cover E-Book', icon: FolderOpen, color: 'bg-warning-100 text-warning-600' },
    { key: 'other', label: 'Lainnya', icon: Image, color: 'bg-secondary-100 text-secondary-600' },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-secondary-900">Penggunaan Storage</h3>
      </div>
      <div className="card-body">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary-100">
            <HardDrive className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-900">
              {storageData?.totalSizeFormatted || '0 Bytes'}
            </p>
            <p className="text-sm text-secondary-500">{storageData?.fileCount || 0} file</p>
          </div>
        </div>

        {storageData?.fileCount === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-secondary-500">
              Belum ada file di storage
            </p>
            <p className="text-xs text-secondary-400 mt-1">
              Upload cover buku, foto member, atau cover e-book untuk melihat penggunaan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {breakdownItems.map((item) => {
              const Icon = item.icon
              const data = storageData?.breakdown[item.key as keyof StorageData['breakdown']]
              const percentage = storageData?.totalSize 
                ? Math.round((data?.size || 0) / storageData.totalSize * 100) 
                : 0

              return (
                <div key={item.key} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-secondary-900">{item.label}</span>
                      <span className="text-xs text-secondary-500">{data?.formatted || '0 Bytes'}</span>
                    </div>
                    <div className="w-full bg-secondary-100 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
