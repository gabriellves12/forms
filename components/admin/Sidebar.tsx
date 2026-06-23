'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase/browser';

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const sb = getBrowserSupabase();
    await sb.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const cls = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `admin-side__link ${active ? 'active' : ''}`;
  };

  return (
    <aside className="admin-side">
      <div className="admin-side__brand">
        Think Brand
        <small>Painel de briefings</small>
      </div>

      <nav className="admin-side__group">
        <div className="admin-side__label">Briefings</div>
        <Link href="/" className={cls('/', true)}>Histórico</Link>
      </nav>

      <nav className="admin-side__group">
        <div className="admin-side__label">Configuração</div>
        <Link href="/templates" className={cls('/templates')}>Templates</Link>
      </nav>

      <div className="admin-side__footer">
        <div style={{ fontSize: 12, color: 'var(--tb-neutral-400)', marginBottom: 8 }}>
          {email}
        </div>
        <button className="admin-side__logout" onClick={logout}>
          Sair
        </button>
      </div>
    </aside>
  );
}
