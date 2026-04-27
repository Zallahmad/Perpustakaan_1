# Perpustakaan Sekolah (Next.js + Supabase)

Aplikasi web perpustakaan sekolah dengan fitur:
- Auth role `admin`, `petugas`, `member` (Supabase Auth + profile role).
- CRUD member + kartu member digital (QR code + foto + nomor otomatis).
- CRUD buku fisik (stok, kategori, cover).
- Alur peminjaman/pengembalian + status terlambat + denda otomatis.
- Katalog e-book dari sumber legal/open access.
- Laporan bulanan + endpoint export PDF/Excel.

## Struktur Project

```txt
.
├─ app/
│  ├─ admin/
│  │  ├─ page.tsx                 # dashboard admin
│  │  ├─ books/page.tsx           # CRUD buku
│  │  ├─ members/page.tsx         # CRUD member
│  │  └─ transactions/page.tsx    # alur peminjaman/pengembalian
│  ├─ api/reports/monthly/route.ts# data laporan bulanan (template export)
│  ├─ member/page.tsx             # halaman member
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  └─ MemberCardQR.tsx            # kartu member QR
├─ lib/
│  ├─ supabase.ts                 # Supabase client
│  ├─ report-queries.ts           # query laporan bulanan
│  └─ types.ts                    # types domain
├─ sql/
│  └─ supabase_schema.sql         # schema Supabase lengkap + RLS + fungsi
├─ .env.example
├─ package.json
└─ README.md
```

## Setup

1. Install dependency
   ```bash
   npm install
   ```
2. Buat project Supabase, lalu isi `.env.local` dari `.env.example`.
3. Jalankan SQL pada file `sql/supabase_schema.sql` di Supabase SQL Editor.
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## Catatan Implementasi

- **Auth + Role**: role disimpan pada `public.profiles.role` dan dipakai di RLS policy.
- **Nomor member otomatis**: fungsi `generate_member_no()` + trigger `set_member_defaults()`.
- **Peminjaman**: gunakan RPC `create_loan(member_id, book_id, due_date)` agar stok otomatis berkurang.
- **Pengembalian**: gunakan RPC `process_return(loan_id, return_date)` agar status dan denda otomatis.
- **Storage Supabase**:
  - bucket `member-photos` untuk foto member
  - bucket `book-covers` untuk cover buku
- **Export PDF/Excel**:
  - endpoint `/api/reports/monthly` menyediakan query template.
  - implementasi final dapat memakai `xlsx` untuk Excel dan library PDF (contoh: `@react-pdf/renderer` atau server-side `pdfkit`).

## Sumber legal/open access untuk e-book scraping

- Project Gutenberg
- Open Library
- DOAB (Directory of Open Access Books)
- UNESCO Open Access

> Pastikan scraping mengikuti Terms of Service tiap sumber.
