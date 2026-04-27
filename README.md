# Perpustakaan Sekolah - Aplikasi Manajemen Perpustakaan Modern

Aplikasi web perpustakaan sekolah yang dibangun dengan Next.js (App Router), Supabase, dan Tailwind CSS. Aplikasi ini menyediakan sistem manajemen perpustakaan lengkap dengan autentikasi, dashboard analytics, manajemen buku, member, peminjaman, e-book, dan laporan.

## Fitur Utama

### 1. Autentikasi & Role Management
- Login dengan Supabase Auth
- Tiga role pengguna: **Admin**, **Petugas**, **Member**
- Redirect otomatis berdasarkan role
- Middleware proteksi route

### 2. Dashboard Admin
- Total buku, e-book, member, dan peminjaman aktif
- Grafik peminjaman bulanan
- Buku paling sering dipinjam
- Peminjaman terbaru

### 3. Manajemen Member
- CRUD member dengan nomor auto-generate (format: MBR-YYYY-XXXX)
- Upload foto member
- Generate QR Code
- Halaman detail member
- Kartu member digital (dengan cetak PDF dan download)

### 4. Manajemen Buku
- CRUD buku dengan upload cover
- Kategori buku
- Stok dan stok tersedia
- Lokasi rak

### 5. Peminjaman
- Tambah peminjaman dengan pilihan member dan buku
- Tanggal pinjam dan jatuh tempo
- Status: dipinjam / kembali / terlambat
- Hitung denda otomatis (Rp 1.000/hari)
- Pengembalian buku

### 6. E-Book
- Grid card untuk koleksi e-book
- Cover, sumber, dan link baca
- Filter dan pencarian

### 7. Laporan Bulanan
- Filter berdasarkan bulan dan tahun
- Statistik: total peminjaman, pengembalian, terlambat, denda
- Export PDF dan Excel (simulasi)
- Grafik peminjaman harian

### 8. QR Scanner (Simulasi)
- Input nomor member atau scan QR
- Tampilkan data member lengkap

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Icons**: Lucide React
- **QR Code**: qrcode.react

## Struktur Folder

```
perpustakaan-sekolah/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Redirect ke login
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── login/                    # Halaman login
│   ├── dashboard/                # Dashboard admin
│   ├── books/                    # Manajemen buku
│   ├── members/                  # Manajemen member
│   │   └── [id]/
│   │       ├── page.tsx          # Detail member
│   │       └── card/             # Kartu member
│   ├── borrowings/               # Peminjaman
│   ├── ebooks/                   # E-Book
│   ├── reports/                  # Laporan
│   ├── scan/                     # QR Scanner
│   └── unauthorized/             # Akses ditolak
├── components/                   # React components
│   ├── Sidebar.tsx               # Sidebar navigasi
│   ├── Topbar.tsx                # Topbar header
│   └── DashboardLayout.tsx       # Layout dashboard
├── lib/                          # Utility functions
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Helper functions
├── types/                        # TypeScript types
│   └── index.ts
├── supabase/                     # Database schema
│   └── schema.sql
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Setup Project

### 1. Clone dan Install Dependencies

```bash
cd perpustakaan
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy SQL schema dari `supabase/schema.sql` ke SQL Editor Supabase
3. Jalankan query untuk membuat tabel, triggers, dan policies
4. Buat storage bucket `library-assets` dengan folder:
   - `book-covers/`
   - `member-photos/`
   - `ebook-covers/`

### 3. Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Akses aplikasi di `http://localhost:3000`

## Database Schema

### Tables

- **categories** - Kategori buku
- **members** - Data member perpustakaan
- **books** - Data buku fisik
- **ebooks** - Data e-book
- **borrowings** - Data peminjaman
- **fines** - Data denda
- **user_roles** - Role pengguna

### Auto-Generated Fields

- **member_number**: Format `MBR-YYYY-XXXX` (auto-increment)
- **borrowing_number**: Format `BRW-YYYYMMDD-XXXX` (auto-increment)

### RLS Policies

Semua tabel dilengkapi Row Level Security (RLS) untuk proteksi data:
- Admin & Petugas: Full access
- Member: Read-only untuk e-book

## Fitur Role

| Fitur | Admin | Petugas | Member |
|-------|-------|---------|--------|
| Dashboard | ✅ | ✅ | ❌ |
| Buku | ✅ | ✅ | ❌ |
| Member | ✅ | ✅ | ❌ |
| Peminjaman | ✅ | ✅ | ❌ |
| E-Book | ✅ | ✅ | ✅ |
| Laporan | ✅ | ✅ | ❌ |
| Scan QR | ✅ | ✅ | ❌ |

## Cara Penggunaan

### Login
1. Masukkan email dan password
2. Redirect otomatis berdasarkan role:
   - Admin/Petugas → Dashboard
   - Member → E-Book

### Menambah Member
1. Buka menu **Member**
2. Klik **Tambah Member**
3. Isi data member (foto opsional)
4. Simpan - nomor member akan auto-generate

### Peminjaman Buku
1. Buka menu **Peminjaman**
2. Klik **Tambah Peminjaman**
3. Pilih member dan buku
4. Set tanggal jatuh tempo (default: 7 hari)
5. Simpan

### Pengembalian
1. Buka menu **Peminjaman**
2. Cari peminjaman aktif
3. Klik **Kembalikan**
4. Denda akan dihitung otomatis jika terlambat

### Kartu Member
1. Buka detail member
2. Klik **Kartu Member**
3. Tampilkan QR code dan data member
4. Bisa cetak atau download

### QR Scanner
1. Buka menu **Scan QR**
2. Masukkan nomor member atau scan QR
3. Data member akan ditampilkan

## Customization

### Warna Theme

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    // ...
  },
}
```

### Denda

Edit di `lib/utils.ts`:

```typescript
export function calculateFine(dueDate: string, finePerDay: number = 1000): number
```

## Deployment

### Build untuk Production

```bash
npm run build
```

### Deploy ke Vercel

1. Push ke GitHub
2. Import project di Vercel
3. Tambah environment variables
4. Deploy

## Troubleshooting

### Error: "Cannot find module"
- Jalankan `npm install` untuk menginstall dependencies

### Error: "Invalid API key"
- Periksa environment variables Supabase
- Pastikan URL dan anon key sudah benar

### Error: "RLS policy violation"
- Pastikan user sudah login
- Periksa role di tabel `user_roles`

## License

MIT License

---

Dibuat dengan ❤️ untuk perpustakaan sekolah Indonesia
