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
      <aside className="login-aside" aria-hidden>
        <div className="login-aside__inner">
          <img src="/logo02.svg" alt="Think Brand" className="login-aside__logo" />
          <p className="login-aside__tag">
            Painel de briefings · respostas, templates e novos projetos em um só lugar.
          </p>
        </div>
        <div className="login-aside__foot">
          <span>© Think Brand</span>
          <span>briefing.thinkbrand.com.br</span>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <div className="login-card__brand">
            <img src="/logo02.svg" alt="Think Brand" />
          </div>
          <div className="login-eyebrow">Painel administrativo</div>
          <h1 className="login-title">Bem-vindo de volta.</h1>
          <p className="login-sub">Entre com seu e-mail e senha para acessar o painel.</p>
          <LoginForm next={searchParams.next ?? '/'} initialError={searchParams.error} />
        </div>
      </main>
    </div>
  );
}
