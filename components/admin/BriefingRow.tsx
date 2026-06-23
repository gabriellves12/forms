'use client';

import { useRouter } from 'next/navigation';

const STATUS_LABEL: Record<string, string> = {
  new: 'Novo',
  seen: 'Visto',
  archived: 'Arquivado',
};

export interface BriefingRowData {
  id: string;
  client_name: string | null;
  product_name: string | null;
  status: string;
  submitted_at: string;
}

export default function BriefingRow({ b }: { b: BriefingRowData }) {
  const router = useRouter();
  const muted = { color: 'var(--tb-text-muted)' };
  return (
    <tr onClick={() => router.push(`/briefings/${b.id}`)}>
      <td>{b.client_name || <span style={muted}>—</span>}</td>
      <td>{b.product_name || <span style={muted}>—</span>}</td>
      <td>
        <span className={`admin-badge admin-badge--${b.status}`}>
          {STATUS_LABEL[b.status] || b.status}
        </span>
      </td>
      <td>{new Date(b.submitted_at).toLocaleString('pt-BR')}</td>
    </tr>
  );
}
