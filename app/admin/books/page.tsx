'use client'

import { useState } from 'react'
import { Book } from '@/types'

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [form, setForm] = useState<{
    id: string
    isbn: string
    title: string
    author: string
    publisher: string
    publication_year: string
    category_id: string
    stock: number
    available_stock: number
    shelf_location: string
    cover_url: string
    description: string
  }>({
    id: '',
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publication_year: '',
    category_id: '',
    stock: 0,
    available_stock: 0,
    shelf_location: '',
    cover_url: '',
    description: '',
  })

  const edit = (book: Book) => {
    setForm({
      id: book.id,
      isbn: book.isbn ?? '',
      title: book.title ?? '',
      author: book.author ?? '',
      publisher: book.publisher ?? '',
      publication_year: book.publication_year?.toString() ?? '',
      category_id: book.category_id ?? '',
      stock: book.stock ?? 0,
      available_stock: book.available_stock ?? 0,
      shelf_location: book.shelf_location ?? '',
      cover_url: book.cover_url ?? '',
      description: book.description ?? '',
    })
  }

  const remove = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Books</h1>
      <p className="text-gray-600">This page is for admin book management.</p>
    </div>
  )
}
