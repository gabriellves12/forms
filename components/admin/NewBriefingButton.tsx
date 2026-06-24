'use client';

import { useState } from 'react';
import NewBriefingModal from './NewBriefingModal';
import type { QuestionCardData } from './QuestionCard';

interface Props {
  categoryName: string;
  categorySlug: string;
  templateId: string;
  categoryId: string;
  templateQuestions: QuestionCardData[];
  variant?: 'primary' | 'large';
  label?: string;
}

export default function NewBriefingButton({
  categoryName,
  categorySlug,
  templateId,
  categoryId,
  templateQuestions,
  variant = 'primary',
  label,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn--primary"
        onClick={() => setOpen(true)}
        style={variant === 'large' ? { marginTop: 16 } : undefined}
      >
        <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
        {label ?? `Novo briefing de ${categoryName}`}
      </button>
      <NewBriefingModal
        open={open}
        onClose={() => setOpen(false)}
        categoryName={categoryName}
        categorySlug={categorySlug}
        templateId={templateId}
        categoryId={categoryId}
        templateQuestions={templateQuestions}
      />
    </>
  );
}
