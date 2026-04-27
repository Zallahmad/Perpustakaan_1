import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

export function calculateDaysOverdue(dueDate: string | Date): number {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export function calculateFine(dueDate: string | Date, finePerDay: number = 1000): number {
  const daysOverdue = calculateDaysOverdue(dueDate)
  return daysOverdue * finePerDay
}

export function generateQRCodeData(memberNumber: string): string {
  return `LIB:${memberNumber}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'dipinjam': 'bg-warning-100 text-warning-600',
    'kembali': 'bg-success-100 text-success-600',
    'terlambat': 'bg-danger-100 text-danger-600',
    'active': 'bg-success-100 text-success-600',
    'inactive': 'bg-secondary-100 text-secondary-600',
  }
  return colors[status] || 'bg-secondary-100 text-secondary-600'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'dipinjam': 'Dipinjam',
    'kembali': 'Dikembalikan',
    'terlambat': 'Terlambat',
    'active': 'Aktif',
    'inactive': 'Nonaktif',
    'admin': 'Admin',
    'petugas': 'Petugas',
    'member': 'Member',
    'siswa': 'Siswa',
    'guru': 'Guru',
    'karyawan': 'Karyawan',
  }
  return labels[status] || status
}

export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[month - 1] || ''
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getYearsList(startYear: number = 2020): number[] {
  const currentYear = getCurrentYear()
  const years: number[] = []
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year)
  }
  return years
}
