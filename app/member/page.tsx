import MemberCardQR from '@/components/MemberCardQR';
import type { Member } from '@/lib/types';

const demoMember: Member = {
  id: 'e7f1654f-266e-4a16-a58e-b4cb6369bc1d',
  member_no: 'MBR-2026-0001',
  full_name: 'Aulia Rahman',
  email: 'aulia@sekolah.id',
  phone: '08123456789',
  role: 'member',
  class_name: 'XI IPA 2',
  photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250',
  qr_payload: 'MBR-2026-0001|e7f1654f-266e-4a16-a58e-b4cb6369bc1d',
  active: true
};

export default function MemberPage() {
  return (
    <div className="stack">
      <h1>Halaman Member</h1>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        <MemberCardQR member={demoMember} />
        <div className="card stack">
          <h3>Riwayat Pinjaman</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Buku</th>
                <th>Tgl Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Fisika Modern Dasar</td>
                <td>2026-04-01</td>
                <td>2026-04-08</td>
                <td>Dikembalikan</td>
              </tr>
              <tr>
                <td>Matematika Diskrit</td>
                <td>2026-04-20</td>
                <td>2026-04-27</td>
                <td>Dipinjam</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
