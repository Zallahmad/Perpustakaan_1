'use client'

import { useState, useEffect } from 'react'
import GuruLayout from '@/components/GuruLayout'
import { createClient } from '@/lib/supabase'
import { Book, Category } from '@/types'
import { 
  Search, 
  BookOpen,
  Filter
} from 'lucide-react'

interface BookWithCategory extends Book {
  category?: Category
}

export default function KatalogBukuPage() {
  const supabase = createClient()
  const [books, setBooks] = useState<BookWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchQuery || selectedCategory) {
      fetchBooks()
    }
  }, [searchQuery, selectedCategory])

  async function fetchBooks() {
    try {
      let query = supabase
        .from('books')
        .select('*, category:categories(*)')
        .gt('available_stock', 0)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,isbn.ilike.%${searchQuery}%`)
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      const { data, error } = await query

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

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <GuruLayout title="Katalog Buku" subtitle="Jelajahi koleksi buku perpustakaan">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Cari buku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3 className="empty-state-title">Tidak ada buku ditemukan</h3>
          <p className="empty-state-description">
            Coba kata kunci atau kategori lain
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <div key={book.id} className="card group">
              <div className="aspect-[3/4] relative overflow-hidden bg-secondary-100">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-secondary-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-success-500 text-white text-xs px-2 py-1 rounded-full">
                  {book.available_stock} tersedia
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-secondary-900 text-sm line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-secondary-500 mb-2">{book.author}</p>
                {book.category && (
                  <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                    {book.category.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GuruLayout>
  )
}
