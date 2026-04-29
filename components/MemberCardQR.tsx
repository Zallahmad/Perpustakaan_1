'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Member } from '@/lib/types';

interface Props {
  member: Member;
}

export default function MemberCardQR({ member }: Props) {
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    QRCode.toDataURL(member.qr_payload, { width: 160, margin: 1 }).then(setQrSrc);
  }, [member.qr_payload]);

  return (
    <div className="card" style={{ maxWidth: 360 }}>
      <h3>Kartu Member Digital</h3>
      <p><strong>{member.full_name}</strong></p>
      <p className="helper">No. Member: {member.member_no}</p>
      <p className="helper">Role: {member.role}</p>
      {member.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photo_url} alt={member.full_name} style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }} />
      ) : null}
      {qrSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrSrc} alt={`QR ${member.member_no}`} style={{ marginTop: 12 }} />
      ) : (
        <p className="helper">Membuat QR...</p>
      )}
    </div>
  );
}
