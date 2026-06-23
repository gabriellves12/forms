import type { ReactNode } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import Sidebar from '@/components/admin/Sidebar';
import '@/styles/admin.css';

export const metadata = { title: 'Admin · Think Brand' };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();

  // /admin/login renderiza sem shell — usa este layout só pra estilos globais
  if (!data.user) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <Sidebar email={data.user.email ?? ''} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
