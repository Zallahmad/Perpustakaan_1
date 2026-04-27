import { monthlyReportQuery } from '@/lib/report-queries';

const stats = [
  { label: 'Total Member Aktif', value: 458 },
  { label: 'Total Judul Buku', value: 1260 },
  { label: 'Buku Dipinjam', value: 172 },
  { label: 'Denda Bulan Ini', value: 'Rp 1.250.000' }
];

const legalSources = [
  'https://www.gutenberg.org/',
  'https://openlibrary.org/',
  'https://doabooks.org/',
  'https://www.unesco.org/'
];

export default function AdminDashboardPage() {
  return (
    <div className="stack">
      <div className="header">
        <div>
          <h1>Dashboard Admin</h1>
          <p className="helper">Ringkasan operasional perpustakaan, kontrol data master, dan laporan.</p>
        </div>
      </div>

      <section className="grid grid-3">
        {stats.map((item) => (
          <article className="card" key={item.label}>
            <p className="helper">{item.label}</p>
            <h2>{item.value}</h2>
          </article>
        ))}
      </section>

      <section className="card stack">
        <h2>Katalog E-Book (Sumber Legal/Open Access)</h2>
        <p className="helper">
          Pipeline scraping berjalan melalui job server terjadwal. Simpan sumber legal di tabel <code>ebook_sources</code>,
          lalu parsing metadata ke tabel <code>ebooks</code>.
        </p>
        <ul>
          {legalSources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </section>

      <section className="card stack">
        <h2>Query Laporan Bulanan (Supabase SQL)</h2>
        <pre style={{ overflowX: 'auto' }}>{monthlyReportQuery}</pre>
      </section>
    </div>
  );
}
