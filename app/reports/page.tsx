'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'
import { formatNumber, formatCurrency, formatDate, getMonthName } from '@/lib/utils'

interface ReportData {
  total_borrowings: number
  total_returns: number
  total_late: number
  total_fines: number
  borrowings_by_day: { date: string; count: number }[]
  top_books: { title: string; borrow_count: number }[]
}

export default function ReportsPage() {
  const supabase = createClient()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    fetchReportData()
  }, [selectedMonth, selectedYear])

  async function fetchReportData() {
    setLoading(true)
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1)
      const endDate = new Date(selectedYear, selectedMonth, 0)

      const startStr = startDate.toISOString()
      const endStr = endDate.toISOString()

      // Fetch borrowings in the selected month
      const { data: borrowings } = await supabase
        .from('borrowings')
        .select('*, fines(amount)')
        .gte('borrow_date', startStr)
        .lte('borrow_date', endStr)

      // Fetch top books
      const { data: topBooks } = await supabase
        .from('borrowings')
        .select('book:books(title)')
        .gte('borrow_date', startStr)
        .lte('borrow_date', endStr)
        .limit(100)

      // Calculate statistics
      const total_borrowings = borrowings?.length || 0
      const total_returns = borrowings?.filter(b => b.status === 'kembali').length || 0
      const total_late = borrowings?.filter(b => b.status === 'terlambat').length || 0
      const total_fines = borrowings?.reduce((sum, b) => {
        return sum + (b.fines?.reduce((f: number, fine: any) => f + (fine.amount || 0), 0) || 0)
      }, 0) || 0

      // Group by day
      const borrowingsByDay = borrowings?.reduce((acc: any, b: any) => {
        const date = b.borrow_date
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const borrowings_by_day = Object.entries(borrowingsByDay || {})
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Top books
      const bookCounts: Record<string, number> = {}
      topBooks?.forEach((b: any) => {
        const title = b.book?.title
        if (title) {
          bookCounts[title] = (bookCounts[title] || 0) + 1
        }
      })

      const top_books = Object.entries(bookCounts)
        .map(([title, borrow_count]) => ({ title, borrow_count }))
        .sort((a, b) => b.borrow_count - a.borrow_count)
        .slice(0, 5)

      setReportData({
        total_borrowings,
        total_returns,
        total_late,
        total_fines,
        borrowings_by_day,
        top_books,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  function exportToPDF() {
    alert('Export PDF akan menghasilkan laporan dalam format PDF')
  }

  function exportToExcel() {
    alert('Export Excel akan menghasilkan laporan dalam format Excel')
  }

  return (
    <DashboardLayout title="Laporan Bulanan" subtitle="Statistik dan laporan perpustakaan">
      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary-400" />
              <span className="text-sm font-medium text-secondary-700">Periode:</span>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="select w-40"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="select w-32"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="ml-auto flex gap-2">
              <button onClick={exportToPDF} className="btn-outline">
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              <button onClick={exportToExcel} className="btn-outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : reportData ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="stat-label">Total Peminjaman</span>
                <TrendingUp className="w-4 h-4 text-primary-500" />
              </div>
              <p className="stat-value">{formatNumber(reportData.total_borrowings)}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="stat-label">Pengembalian</span>
                <TrendingUp className="w-4 h-4 text-success-500" />
              </div>
              <p className="stat-value text-success-600">{formatNumber(reportData.total_returns)}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="stat-label">Terlambat</span>
                <TrendingDown className="w-4 h-4 text-danger-500" />
              </div>
              <p className="stat-value text-danger-600">{formatNumber(reportData.total_late)}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="stat-label">Total Denda</span>
                <FileText className="w-4 h-4 text-warning-500" />
              </div>
              <p className="stat-value text-warning-600">{formatCurrency(reportData.total_fines)}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-secondary-900">Peminjaman Harian</h3>
              </div>
              <div className="card-body">
                {reportData.borrowings_by_day.length === 0 ? (
                  <p className="text-center text-secondary-500 py-8">Tidak ada data</p>
                ) : (
                  <div className="h-64 flex items-end justify-between gap-1">
                    {reportData.borrowings_by_day.map((day) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full max-w-[30px] bg-primary-500 rounded-t"
                          style={{ height: `${Math.max(day.count * 10, 4)}px` }}
                        />
                        <span className="text-xs text-secondary-400">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Books */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-secondary-900">Buku Terpopuler</h3>
              </div>
              <div className="card-body">
                {reportData.top_books.length === 0 ? (
                  <p className="text-center text-secondary-500 py-8">Tidak ada data</p>
                ) : (
                  <div className="space-y-3">
                    {reportData.top_books.map((book, index) => (
                      <div key={book.title} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">
                            {book.title}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary-600">
                          {book.borrow_count}x
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <FileText className="empty-state-icon" />
          <p className="text-secondary-500">Tidak ada data untuk periode ini</p>
        </div>
      )}
    </DashboardLayout>
  )
}
