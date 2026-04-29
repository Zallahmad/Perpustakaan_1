'use client';

import { useMemo, useState } from 'react';
import { format, addDays, differenceInDays, startOfDay } from 'date-fns';
import type { Loan } from '@/lib/types';

const FINE_PER_DAY = 2000;

const initialLoans: Loan[] = [
  {
    id: 'l-1',
    member_id: 'm-1',
    book_id: 'b-1',
    loan_date: '2026-04-15',
    due_date: '2026-04-22',
    return_date: null,
    status: 'dipinjam',
    fine_amount: 0
  }
];

export default function TransactionsPage() {
  const [loans, setLoans] = useState(initialLoans);
  const [form, setForm] = useState({ member_id: '', book_id: '', loan_date: format(new Date(), 'yyyy-MM-dd'), due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd') });

  const submitLoan = () => {
    if (!form.member_id || !form.book_id) return;
    const newLoan: Loan = {
      id: crypto.randomUUID(),
      member_id: form.member_id,
      book_id: form.book_id,
      loan_date: form.loan_date,
      due_date: form.due_date,
      return_date: null,
      status: 'dipinjam',
      fine_amount: 0
    };
    setLoans((prev) => [newLoan, ...prev]);
  };

  const returnBook = (loan: Loan) => {
    const now = new Date();
    const lateDays = Math.max(0, differenceInDays(startOfDay(now), startOfDay(new Date(loan.due_date))));
    const fine = lateDays * FINE_PER_DAY;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              return_date: format(now, 'yyyy-MM-dd'),
              status: lateDays > 0 ? 'terlambat' : 'dikembalikan',
              fine_amount: fine
            }
          : l
      )
    );
  };

  const activeCount = useMemo(() => loans.filter((l) => l.status === 'dipinjam').length, [loans]);

  return (
    <div className="stack">
      <h1>Alur Peminjaman & Pengembalian</h1>
      <div className="card stack">
        <h3>Input Peminjaman</h3>
        <div className="grid grid-3">
          <input placeholder="Member ID" value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} />
          <input placeholder="Book ID" value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })} />
          <input type="date" value={form.loan_date} onChange={(e) => setForm({ ...form, loan_date: e.target.value })} />
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </div>
        <button className="button" onClick={submitLoan}>Simpan Peminjaman</button>
        <p className="helper">Total sedang dipinjam: {activeCount}</p>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Buku</th>
              <th>Status</th>
              <th>Denda</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id.slice(0, 8)}</td>
                <td>{loan.member_id}</td>
                <td>{loan.book_id}</td>
                <td>{loan.status}</td>
                <td>Rp {loan.fine_amount.toLocaleString('id-ID')}</td>
                <td>
                  {loan.status === 'dipinjam' ? (
                    <button className="button secondary" onClick={() => returnBook(loan)}>Proses Pengembalian</button>
                  ) : (
                    <span className="helper">Selesai</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
