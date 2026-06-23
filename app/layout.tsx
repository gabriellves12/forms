import type { Metadata } from 'next';
import '@/styles/tokens.css';

export const metadata: Metadata = {
  title: 'Briefing — Think Brand',
  description: 'Formulários de briefing da Think Brand.',
  icons: { icon: '/icon02.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
