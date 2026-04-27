'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { EBook, Category } from '@/types'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen,
  X,
  Loader2,
  ExternalLink,
  Download,
  Library,
  Image as ImageIcon
} from 'lucide-react'
import { truncateText } from '@/lib/utils'
import imageCompression from 'browser-image-compression'

interface EBookWithCategory extends EBook {
  category?: Category
}

export default function EBooksPage() {
  const supabase = createClient()
  const [ebooks, setEbooks] = useState<EBookWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEBook, setEditingEBook] = useState<EBookWithCategory | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category_id: '',
    source: '',
    read_link: '',
    description: '',
    file_size: '',
    file_format: '',
  })

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  useEffect(() => {
    fetchEBooks()
    fetchCategories()
  }, [selectedCategory])

  async function fetchEBooks() {
    try {
      let query = supabase
        .from('ebooks')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setEbooks(data || [])
    } catch (error) {
      console.error('Error fetching ebooks:', error)
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

  function handleEdit(ebook: EBookWithCategory) {
    setEditingEBook(ebook)
    setFormData({
      title: ebook.title,
      author: ebook.author,
      category_id: ebook.category_id || '',
      source: ebook.source || '',
      read_link: ebook.read_link || '',
      description: ebook.description || '',
      file_size: ebook.file_size || '',
      file_format: ebook.file_format || '',
    })
    setCoverPreview(ebook.cover_url || '')
    setIsModalOpen(true)
  }

  function handleAdd() {
    setEditingEBook(null)
    setFormData({
      title: '',
      author: '',
      category_id: '',
      source: '',
      read_link: '',
      description: '',
      file_size: '',
      file_format: '',
    })
    setCoverFile(null)
    setCoverPreview('')
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let coverUrl = editingEBook?.cover_url || ''

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `ebook-covers/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('library-assets')
          .upload(filePath, coverFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Gagal upload cover: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('library-assets')
          .getPublicUrl(filePath)

        coverUrl = publicUrl
      }

      const ebookData = {
        title: formData.title,
        author: formData.author,
        category_id: formData.category_id || null,
        cover_url: coverUrl || null,
        file_url: formData.read_link || '#',
        source: formData.source || null,
        read_link: formData.read_link || null,
        description: formData.description || null,
        file_size: formData.file_size || null,
        file_format: formData.file_format || null,
        is_active: true,
      }

      if (editingEBook) {
        const { error } = await supabase
          .from('ebooks')
          .update(ebookData)
          .eq('id', editingEBook.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ebooks')
          .insert(ebookData)

        if (error) throw error
      }

      setIsModalOpen(false)
      fetchEBooks()
    } catch (error) {
      console.error('Error saving ebook:', error)
      alert('Gagal menyimpan e-book')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus e-book ini?')) return

    try {
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchEBooks()
    } catch (error) {
      console.error('Error deleting ebook:', error)
      alert('Gagal menghapus e-book')
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

  const filteredEBooks = ebooks.filter(ebook =>
    ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ebook.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout title="E-Book" subtitle="Koleksi buku digital" allowedRoles={['admin', 'petugas', 'member', 'guru']}>
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari e-book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full sm:w-80"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select w-full sm:w-48"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah E-Book
        </button>
      </div>

      {/* E-Books Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredEBooks.length === 0 ? (
        <div className="empty-state">
          <Library className="empty-state-icon" />
          <h3 className="empty-state-title">Belum ada e-book</h3>
          <p className="empty-state-description">
            {searchQuery ? 'Tidak ada e-book yang sesuai' : 'Mulai tambahkan koleksi e-book'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredEBooks.map((ebook) => (
            <div key={ebook.id} className="card group">
              <div className="aspect-[3/4] relative overflow-hidden bg-secondary-100">
                {ebook.cover_url ? (
                  <img
                    src={ebook.cover_url}
                    alt={ebook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-secondary-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="flex gap-2">
                    <a
                      href={ebook.read_link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-primary py-1.5 text-xs text-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1 inline" />
                      Baca
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-primary-600 font-medium mb-1">
                  {ebook.category?.name || 'Tanpa Kategori'}
                </p>
                <h3 className="font-semibold text-secondary-900 text-sm mb-1 line-clamp-2">
                  {ebook.title}
                </h3>
                <p className="text-xs text-secondary-500">{ebook.author}</p>
                <div className="flex items-center justify-between mt-2">
                  {ebook.file_format && (
                    <span className="text-xs text-secondary-400">
                      {ebook.file_format.toUpperCase()}
                      {ebook.file_size && ` • ${ebook.file_size}`}
                    </span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(ebook)}
                      className="p-1 rounded text-secondary-400 hover:text-secondary-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(ebook.id)}
                      className="p-1 rounded text-danger-400 hover:text-danger-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
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
                  {editingEBook ? 'Edit E-Book' : 'Tambah E-Book'}
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
                  <label className="form-label">Cover E-Book</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-secondary-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-secondary-300">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-secondary-400" />
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
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Judul *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Penulis *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
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
                    <label className="form-label">Sumber</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="input"
                      placeholder="Contoh: Google Books"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Format File</label>
                    <input
                      type="text"
                      value={formData.file_format}
                      onChange={(e) => setFormData({ ...formData, file_format: e.target.value })}
                      className="input"
                      placeholder="PDF, EPUB, etc"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ukuran File</label>
                    <input
                      type="text"
                      value={formData.file_size}
                      onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                      className="input"
                      placeholder="Contoh: 2.5 MB"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Link Baca *</label>
                  <input
                    type="url"
                    required
                    value={formData.read_link}
                    onChange={(e) => setFormData({ ...formData, read_link: e.target.value })}
                    className="input"
                    placeholder="https://..."
                  />
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
