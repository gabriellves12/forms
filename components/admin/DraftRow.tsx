'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBriefingDraft } from '@/app/(admin)/drafts/actions';

export interface DraftRowData {
  id: string;
  client_label: string | null;
  share_slug: string | null;
  share_token: string;
  created_at: string;
}

export default function DraftRow({ d }: { d: DraftRowData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const muted = { color: 'var(--tb-text-muted)' };
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const sharePath = d.share_slug ? `/${d.share_slug}` : `/b/${d.share_token}`;
  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${sharePath}` : sharePath;

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const label = d.client_label || 'este briefing aguardando';
    if (!confirm(`Excluir ${label}? O link compartilhado deixará de funcionar.`)) return;
    startTransition(async () => {
      await deleteBriefingDraft(d.id);
      router.refresh();
    });
  };

  const onRowClick = () => {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <tr onClick={onRowClick} title="Abrir formulário do cliente em nova aba">
      <td>{d.client_label || <span style={muted}>—</span>}</td>
      <td><span style={muted}>—</span></td>
      <td>
        <span className="admin-badge admin-badge--waiting">Aguardando</span>
      </td>
      <td>{new Date(d.created_at).toLocaleString('pt-BR')}</td>
      <td className="row-actions" onClick={stop}>
        <div className="row-actions__group">
          <button
            type="button"
            className="row-action"
            onClick={onCopy}
            title="Copiar link do cliente"
            aria-label="Copiar link"
          >
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <button
            type="button"
            className="row-action row-action--danger"
            onClick={onDelete}
            disabled={pending}
            title="Excluir briefing aguardando"
            aria-label="Excluir"
          >
            {pending ? '...' : 'Excluir'}
          </button>
        </div>
      </td>
    </tr>
  );
}
