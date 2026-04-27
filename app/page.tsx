import Link from 'next/link';

export default function Home() {
  return (
    <div className="card stack">
      <h1>Perpustakaan Sekolah</h1>
      <p className="helper">Starter project Next.js + Supabase untuk manajemen perpustakaan sekolah.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/admin" className="button">Masuk Dashboard Admin</Link>
        <Link href="/member" className="button secondary">Masuk Halaman Member</Link>
      </div>
    </div>
  );
}
