'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { Book, Category } from '@/types'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen,
  X,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'
import { formatNumber, truncateText } from '@/lib/utils'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

interface BookWithCategory extends Book {
  category?: Category
}

export default function BooksPage() {
  const supabase = createClient()
  const [books, setBooks] = useState<BookWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookWithCategory | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: '',
    category_id: '',
    stock: '',
    available_stock: '',
    description: '',
    shelf_location: '',
  })

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  function handleEdit(book: BookWithCategory) {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year?.toString() || '',
      category_id: book.category_id || '',
      stock: book.stock.toString(),
      available_stock: book.available_stock.toString(),
      description: book.description || '',
      shelf_location: book.shelf_location || '',
    })
    setCoverPreview(book.cover_url || '')
    setIsModalOpen(true)
  }

  function handleAdd() {
    setEditingBook(null)
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publication_year: '',
      category_id: '',
      stock: '',
      available_stock: '',
      description: '',
      shelf_location: '',
    })
    setCoverFile(null)
    setCoverPreview('')
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let coverUrl = editingBook?.cover_url || ''

      // Upload cover if selected
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `book-covers/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('library-assets')
          .upload(filePath, coverFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('library-assets')
          .getPublicUrl(filePath)

        coverUrl = publicUrl
      }

      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || null,
        publisher: formData.publisher || null,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        available_stock: parseInt(formData.available_stock) || 0,
        description: formData.description || null,
        shelf_location: formData.shelf_location || null,
        cover_url: coverUrl || null,
      }

      if (editingBook) {
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', editingBook.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('books')
          .insert(bookData)

        if (error) throw error
      }

      setIsModalOpen(false)
      fetchBooks()
    } catch (error) {
      console.error('Error saving book:', error)
      alert('Gagal menyimpan buku')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) return

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Gagal menghapus buku')
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Compress image before processing
      const options = {
        maxSizeMB: 0.5, // Max 500KB
        maxWidthOrHeight: 800, // Max dimension
        useWebWorker: true,
      }
      
      const compressedFile = await imageCompression(file, options)
      setCoverFile(compressedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error compressing image:', error)
      // Fallback to original if compression fails
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout title="Manajemen Buku" subtitle="Kelola koleksi buku perpustakaan">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari buku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full sm:w-80"
            />
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Buku
        </button>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3 className="empty-state-title">Belum ada buku</h3>
          <p className="empty-state-description">
            {searchQuery ? 'Tidak ada buku yang sesuai dengan pencarian' : 'Mulai tambahkan buku ke koleksi perpustakaan'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <div key={book.id} className="card group">
              <div className="aspect-[3/4] relative overflow-hidden bg-secondary-100">
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-secondary-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="flex-1 btn-secondary py-1.5 text-xs"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="btn-danger py-1.5 px-2 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-primary-600 font-medium mb-1">
                  {book.category?.name || 'Tanpa Kategori'}
                </p>
                <h3 className="font-semibold text-secondary-900 mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-secondary-500 mb-3">{book.author}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">
                    Stok: <span className="font-medium text-secondary-700">{formatNumber(book.available_stock)}</span>
                    <span className="text-secondary-400">/{formatNumber(book.stock)}</span>
                  </span>
                  <span className={`badge ${book.available_stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {book.available_stock > 0 ? 'Tersedia' : 'Habis'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-panel">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold text-secondary-900">
                  {editingBook ? 'Edit Buku' : 'Tambah Buku'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary-100"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="card-body space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Cover Upload */}
                <div className="form-group">
                  <label className="form-label">Cover Buku</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-32 bg-secondary-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-secondary-300">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-secondary-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label
                        htmlFor="cover-upload"
                        className="btn-outline text-sm inline-flex cursor-pointer"
                      >
                        {coverPreview ? 'Ganti Cover' : 'Pilih Cover'}
                      </label>
                      <p className="text-xs text-secondary-500 mt-2">
                        Format: JPG, PNG. Maks: 2MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="form-group sm:col-span-2">
                    <label className="form-label">Judul *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="form-group sm:col-span-2">
                    <label className="form-label">Penulis *</label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ISBN</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="select"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Penerbit</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tahun Terbit</label>
                    <input
                      type="number"
                      value={formData.publication_year}
                      onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stok Total *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stok Tersedia *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.available_stock}
                      onChange={(e) => setFormData({ ...formData, available_stock: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lokasi Rak</label>
                    <input
                      type="text"
                      value={formData.shelf_location}
                      onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
                      className="input"
                      placeholder="Contoh: A-12-3"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="textarea"
                  />
                </div>
              </form>

              <div className="card-footer flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
