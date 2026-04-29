export type UserRole = 'admin' | 'petugas' | 'member';

export interface Member {
  id: string;
  member_no: string;
  full_name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  role: UserRole;
  class_name?: string;
  qr_payload: string;
  active: boolean;
}

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author?: string;
  category_id?: string;
  stock_total: number;
  stock_available: number;
  cover_url?: string;
  shelf_location?: string;
}

export interface Loan {
  id: string;
  member_id: string;
  book_id: string;
  loan_date: string;
  due_date: string;
  return_date?: string | null;
  status: 'dipinjam' | 'dikembalikan' | 'terlambat' | 'hilang';
  fine_amount: number;
}
