'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteBriefingInline } from '@/app/(admin)/actions';

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'Em andamento',
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
  const [pending, startTransition] = useTransition();
  const muted = { color: 'var(--tb-text-muted)' };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const onExportJSON = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/api/briefings/${b.id}/export`;
  };
  const onExportCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/api/briefings/${b.id}/export?format=csv`;
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const label = b.client_name || b.product_name || 'este briefing';
    if (!confirm(`Excluir ${label}? Essa ação não pode ser desfeita.`)) return;
    const fd = new FormData();
    fd.set('id', b.id);
    startTransition(async () => {
      await deleteBriefingInline(fd);
      router.refresh();
    });
  };

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
      <td className="row-actions" onClick={stop}>
        <div className="row-actions__group">
          <button
            type="button"
            className="row-action"
            onClick={onExportCSV}
            title="Exportar como CSV"
            aria-label="Exportar CSV"
          >
            CSV
          </button>
          <button
            type="button"
            className="row-action"
            onClick={onExportJSON}
            title="Exportar como JSON"
            aria-label="Exportar JSON"
          >
            JSON
          </button>
          <button
            type="button"
            className="row-action row-action--danger"
            onClick={onDelete}
            disabled={pending}
            title="Excluir briefing"
            aria-label="Excluir"
          >
            {pending ? '...' : 'Excluir'}
          </button>
        </div>
      </td>
    </tr>
  );
}
