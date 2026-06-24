const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function relativeFromNow(iso: string): { rel: string; abs: string } {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  const diffH = Math.round(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  let rel: string;
  if (diffMin < 1) rel = 'Agora';
  else if (diffMin < 60) rel = `há ${diffMin} min`;
  else if (sameDay) rel = `hoje, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  else if (diffD < 2) rel = `ontem, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  else if (diffD < 7) rel = `há ${diffD} dias`;
  else if (date.getFullYear() === now.getFullYear()) rel = `${date.getDate()} ${MONTHS_PT[date.getMonth()]}`;
  else rel = `${date.getDate()} ${MONTHS_PT[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;

  const abs = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(2)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return { rel, abs };
}

export function initialsFrom(...inputs: (string | null | undefined)[]): string {
  for (const s of inputs) {
    if (!s) continue;
    const cleaned = s.trim();
    if (!cleaned) continue;
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) continue;
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return '—';
}
