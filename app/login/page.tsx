'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        console.log('User logged in:', data.user.id)
        
        // Log audit for login
        try {
          await fetch('/api/audit/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'USER_LOGIN',
              user_id: data.user.id,
              user_email: email,
            }),
          })
        } catch (auditError) {
          console.error('Failed to log audit:', auditError)
        }
        
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle()
        
        console.log('Role data:', roleData)
        console.log('Role error:', roleError)

        if (roleError || !roleData) {
          console.error('Role error details:', roleError)
          setError(`User tidak memiliki role. Error: ${roleError?.message || 'No data'}`)
          await supabase.auth.signOut()
          return
        }

        // Redirect based on role
        let redirectPath = '/dashboard'
        if (roleData.role === 'member') {
          redirectPath = '/ebooks'
        } else if (roleData.role === 'guru') {
          redirectPath = '/guru/dashboard'
        } else if (roleData.role === 'petugas') {
          redirectPath = '/dashboard'
        }
        
        console.log('User role:', roleData.role)
        console.log('Redirecting to:', redirectPath)
        
        // Use window.location for reliable redirect
        window.location.href = redirectPath
      }
    } catch (err: any) {
      setError(err.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-600 text-white mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Perpustakaan Sekolah
          </h1>
          <p className="text-secondary-500 mt-1">
            Sistem Manajemen Perpustakaan
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          <div className="card-header text-center">
            <h2 className="text-lg font-semibold text-secondary-900">Masuk ke Akun</h2>
            <p className="text-sm text-secondary-500 mt-1">
              Silakan masukkan email dan password Anda
            </p>
          </div>

          <form onSubmit={handleLogin} className="card-body space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-secondary-500 mt-6">
          © {new Date().getFullYear()} Perpustakaan Sekolah
        </p>
      </div>
    </div>
  )
}
