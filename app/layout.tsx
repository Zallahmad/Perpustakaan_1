<<<<<<< HEAD
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Perpustakaan Sekolah',
  description: 'Sistem Manajemen Perpustakaan Sekolah Modern',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
=======
import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perpustakaan Sekolah',
  description: 'Aplikasi manajemen perpustakaan sekolah berbasis Next.js + Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <nav className="container" style={{ paddingBottom: 0 }}>
          <div className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/admin">Dashboard Admin</Link>
            <Link href="/admin/books">CRUD Buku</Link>
            <Link href="/admin/members">CRUD Member</Link>
            <Link href="/admin/transactions">Transaksi</Link>
            <Link href="/member">Halaman Member</Link>
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
>>>>>>> af1936f632e83dbc3bc588bc8881d3533092e41f
}
