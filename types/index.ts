export type UserRole = 'admin' | 'petugas' | 'member' | 'guru'
export type BorrowingStatus = 'dipinjam' | 'kembali' | 'terlambat'
export type MemberType = 'siswa' | 'guru' | 'karyawan'

export interface Category {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Member {
  id: string
  member_number: string
  user_id?: string
  full_name: string
  email?: string
  phone?: string
  member_type: MemberType
  nis_nip?: string
  class?: string
  address?: string
  photo_url?: string
  qr_code?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Book {
  id: string
  isbn?: string
  title: string
  author: string
  publisher?: string
  publication_year?: number
  category_id?: string
  category?: Category
  stock: number
  available_stock: number
  cover_url?: string
  description?: string
  shelf_location?: string
  created_at?: string
  updated_at?: string
}

export interface EBook {
  id: string
  title: string
  author: string
  category_id?: string
  category?: Category
  cover_url?: string
  file_url: string
  source?: string
  read_link?: string
  description?: string
  file_size?: string
  file_format?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Borrowing {
  id: string
  borrowing_number: string
  member_id: string
  member?: Member
  book_id: string
  book?: Book
  borrow_date: string
  due_date: string
  return_date?: string
  status: BorrowingStatus
  borrowed_by?: string
  returned_by?: string
  notes?: string
  fine?: Fine
  created_at?: string
  updated_at?: string
}

export interface Fine {
  id: string
  borrowing_id: string
  amount: number
  paid_amount: number
  is_paid: boolean
  paid_at?: string
  paid_by?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface UserRoleData {
  id: string
  user_id: string
  role: UserRole
  created_at?: string
  updated_at?: string
}

export interface DashboardStats {
  totalBooks: number
  totalEBooks: number
  totalMembers: number
  activeBorrowings: number
}

export interface MonthlyBorrowingStats {
  month: string
  total_borrowings: number
  total_returns: number
  total_late: number
  total_fines: number
}

export interface MostBorrowedBook {
  id: string
  title: string
  author: string
  cover_url?: string
  category?: string
  borrow_count: number
}

export interface RecentBorrowing {
  id: string
  borrowing_number: string
  borrow_date: string
  due_date: string
  status: BorrowingStatus
  member: {
    full_name: string
    member_number: string
  }
  book: {
    title: string
    author: string
  }
}

export interface ActiveBorrowing {
  id: string
  borrowing_number: string
  borrow_date: string
  due_date: string
  return_date?: string
  status: BorrowingStatus
  member_id: string
  member_number: string
  member_name: string
  class?: string
  book_id: string
  book_title: string
  book_author: string
  estimated_fine: number
}

export interface ReportStats {
  total_borrowings: number
  total_returns: number
  total_late: number
  total_fines: number
}
