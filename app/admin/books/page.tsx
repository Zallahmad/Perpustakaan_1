'use client';

import { useMemo, useState } from 'react';
import type { Book } from '@/lib/types';

const initialBooks: Book[] = [
  {
    id: '1',
    isbn: '9786022912345',
    title: 'Algoritma dan Struktur Data',
    author: 'R. Nugraha',
    category_id: 'teknologi',
    stock_total: 10,
    stock_available: 6,
    shelf_location: 'A-01',
    cover_url: ''
  }
];

const emptyForm = {
  id: '',
  isbn: '',
  title: '',
  author: '',
  category_id: '',
  stock_total: 1,
  stock_available: 1,
  shelf_location: '',
  cover_url: ''
};

export default function BooksCrudPage() {
  const [books, setBooks] = useState(initialBooks);
  const [form, setForm] = useState(emptyForm);
  const isEdit = useMemo(() => Boolean(form.id), [form.id]);

  const submit = () => {
    if (!form.title) return;

    if (isEdit) {
      setBooks((prev) => prev.map((b) => (b.id === form.id ? { ...form } as Book : b)));
    } else {
      setBooks((prev) => [...prev, { ...form, id: crypto.randomUUID() } as Book]);
    }

    setForm(emptyForm);
  };

  const edit = (book: Book) => setForm({ ...book });
  const remove = (id: string) => setBooks((prev) => prev.filter((b) => b.id !== id));

  return (
    <div className="stack">
      <h1>CRUD Buku Fisik</h1>
      <div className="card stack">
        <h3>{isEdit ? 'Edit Buku' : 'Tambah Buku'}</h3>
        <div className="grid grid-3">
          <input placeholder="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          <input placeholder="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Penulis" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <input placeholder="Kategori" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
          <input placeholder="Lokasi Rak" value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} />
          <input placeholder="URL Cover" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
          <input type="number" placeholder="Stok Total" value={form.stock_total} onChange={(e) => setForm({ ...form, stock_total: Number(e.target.value) })} />
          <input type="number" placeholder="Stok Tersedia" value={form.stock_available} onChange={(e) => setForm({ ...form, stock_available: Number(e.target.value) })} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button" onClick={submit}>{isEdit ? 'Update' : 'Simpan'}</button>
          <button className="button secondary" onClick={() => setForm(emptyForm)}>Reset</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}<br /><span className="helper">{book.author}</span></td>
                <td>{book.category_id}</td>
                <td>{book.stock_available}/{book.stock_total}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="button secondary" onClick={() => edit(book)}>Edit</button>
                  <button className="button danger" onClick={() => remove(book.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
