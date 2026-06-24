'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBriefingDraft } from '../actions';

export default function DraftDetailActions({
  draftId,
  sharePath,
  categorySlug,
  clientLabel,
}: {
  draftId: string;
  sharePath: string;
  categorySlug: string;
  clientLabel: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${sharePath}` : sharePath;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const onOpenForm = () => {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const onDelete = () => {
    const label = clientLabel || 'este briefing aguardando';
    if (!confirm(`Excluir ${label}? O link compartilhado deixará de funcionar.`)) return;
    startTransition(async () => {
      await deleteBriefingDraft(draftId);
      router.push(`/?cat=${categorySlug}`);
      router.refresh();
    });
  };

  return (
    <div className="admin-actions">
      <button type="button" className="admin-btn" onClick={onOpenForm}>
        Abrir formulário
      </button>
      <button type="button" className="admin-btn" onClick={onCopy}>
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--danger"
        onClick={onDelete}
        disabled={pending}
      >
        {pending ? '...' : 'Excluir'}
      </button>
    </div>
  );
}
