'use client';

import { useMemo, useState } from 'react';
import type { Member, UserRole } from '@/lib/types';
import MemberCardQR from '@/components/MemberCardQR';

const roleOptions: UserRole[] = ['admin', 'petugas', 'member'];

const generateMemberNo = (count: number) => `MBR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

const initialMembers: Member[] = [
  {
    id: 'm-1',
    member_no: 'MBR-2026-0001',
    full_name: 'Nadia Pratama',
    email: 'nadia@sekolah.id',
    role: 'member',
    phone: '08111111111',
    class_name: 'XII IPS 1',
    qr_payload: 'MBR-2026-0001|m-1',
    active: true,
    photo_url: ''
  }
];

export default function MembersCrudPage() {
  const [members, setMembers] = useState(initialMembers);
  const [preview, setPreview] = useState<Member | null>(initialMembers[0]);
  const [form, setForm] = useState({
    id: '',
    full_name: '',
    email: '',
    role: 'member' as UserRole,
    phone: '',
    class_name: '',
    photo_url: '',
    active: true
  });

  const isEdit = useMemo(() => Boolean(form.id), [form.id]);

  const submit = () => {
    if (!form.full_name || !form.email) return;

    if (isEdit) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === form.id
            ? { ...m, ...form, qr_payload: `${m.member_no}|${m.id}` }
            : m
        )
      );
    } else {
      const id = crypto.randomUUID();
      const memberNo = generateMemberNo(members.length);
      const newMember: Member = {
        id,
        member_no: memberNo,
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        phone: form.phone,
        class_name: form.class_name,
        photo_url: form.photo_url,
        active: form.active,
        qr_payload: `${memberNo}|${id}`
      };
      setMembers((prev) => [...prev, newMember]);
    }

    setForm({ id: '', full_name: '', email: '', role: 'member', phone: '', class_name: '', photo_url: '', active: true });
  };

  const edit = (member: Member) => {
    setForm({
      id: member.id,
      full_name: member.full_name,
      email: member.email,
      role: member.role,
      phone: member.phone ?? '',
      class_name: member.class_name ?? '',
      photo_url: member.photo_url ?? '',
      active: member.active
    });
  };

  const remove = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="stack">
      <h1>CRUD Member</h1>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <section className="card stack">
          <div className="grid grid-3">
            <input placeholder="Nama Lengkap" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <input placeholder="Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="Kelas" value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} />
            <input placeholder="URL Foto" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button" onClick={submit}>{isEdit ? 'Update' : 'Simpan'}</button>
            <button className="button secondary" onClick={() => setForm({ id: '', full_name: '', email: '', role: 'member', phone: '', class_name: '', photo_url: '', active: true })}>Reset</button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>No Member</th>
                <th>Nama</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.member_no}</td>
                  <td>{member.full_name}</td>
                  <td>{member.role}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="button secondary" onClick={() => edit(member)}>Edit</button>
                    <button className="button" onClick={() => setPreview(member)}>Kartu</button>
                    <button className="button danger" onClick={() => remove(member.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside>{preview ? <MemberCardQR member={preview} /> : null}</aside>
      </div>
    </div>
  );
}
