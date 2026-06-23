import LoginForm from './LoginForm';
import '@/styles/admin.css';

export const metadata = { title: 'Login — Admin Think Brand' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <div className="login-shell">
      <div className="login-card">
        <h1 className="login-title">Think Brand · Admin</h1>
        <p className="login-sub">Entre com seu e-mail e senha para acessar o painel.</p>
        <LoginForm next={searchParams.next ?? '/'} initialError={searchParams.error} />
      </div>
    </div>
  );
}
