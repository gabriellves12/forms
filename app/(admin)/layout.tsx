import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import Sidebar from '@/components/admin/Sidebar';
import '@/styles/admin.css';

export const metadata = { title: 'Admin · Think Brand' };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();

  // Middleware gates by cookie presence only — cookies expirados chegam aqui.
  // Validação real do token acontece aqui via getUser().
  if (!data.user) {
    redirect('/login');
  }

  return (
    <div className="admin-shell">
      <Sidebar email={data.user.email ?? ''} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
