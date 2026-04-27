import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-danger-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">
          Akses Ditolak
        </h1>
        
        <p className="text-secondary-500 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          Silakan hubungi administrator jika Anda membutuhkan akses.
        </p>
        
        <Link
          href="/dashboard"
          className="btn-primary inline-flex"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
