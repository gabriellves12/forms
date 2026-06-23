# Think Brand · Briefings

Plataforma de briefings da Think Brand com formulários públicos por categoria
(Identidade Visual, Site Institucional, Landing Page, Copy) e dashboard de admin.

## Stack
- **Next.js 14** (App Router, Server Actions)
- **Supabase** (Postgres + Auth)
- **Vercel** (deploy)

## Estrutura
```
app/
├── briefing/[slug]   → formulário público por categoria
├── admin/            → dashboard (login, histórico, detalhe, templates)
└── api/              → reservada
components/           → form + admin
lib/
├── supabase/         → clients server/browser
└── templates/        → schemas TS dos templates iniciais
styles/               → tokens.css + form.css + admin.css
supabase/migrations/  → SQL (0001_init, 0002_rls)
scripts/              → seed-templates, import-sheets
```

## Setup local

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar projeto Supabase
1. Acessar https://supabase.com → New project (Free).
2. Aguardar provisionamento.
3. **Project Settings → API** → copiar:
   - `Project URL`
   - `anon public`
   - `service_role` (secret)

### 3. Configurar variáveis
```bash
cp .env.local.example .env.local
```
Preencher `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_WHATSAPP_NUMBER=5584998982543
NEXT_PUBLIC_WHATSAPP_MESSAGE=...
```

### 4. Rodar migrations
No painel Supabase → **SQL Editor** → cole e execute, em ordem:
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`

### 5. Criar usuário admin
No painel Supabase → **Authentication → Users → Add user** → email + senha.

### 6. Popular templates
```bash
npm run seed:templates
```
Isso cria as 4 categorias + templates + perguntas.

### 7. Rodar dev
```bash
npm run dev
```
- `http://localhost:3000` → seletor de categoria
- `http://localhost:3000/briefing/identidade-visual` → form direto
- `http://localhost:3000/admin/login`

## Importar histórico do Google Sheets

1. Sheets → **Arquivo → Download → Valores separados por vírgula (.csv)**
2. Salvar como `sheets-export.csv` na raiz do projeto.
3. Rodar:
```bash
npm run import:sheets -- --dry-run     # confere
npm run import:sheets                  # importa de fato
```

Depois de importar, desativar o Apps Script:
**Apps Script → Implantações → Gerenciar implantações → Arquivar.**

## Deploy na Vercel

1. Push do repo pro GitHub.
2. Vercel → **Add New Project** → importar repo.
3. **Environment Variables** → adicionar as 5 do `.env.local`.
4. Deploy.
5. Domínio custom (opcional): Settings → Domains.

## Edição de templates

Pelo painel: `/admin/templates/{slug}` permite editar título, hint, opções, ordem
e adicionar/remover perguntas. Histórico anterior é preservado (referencia o
template original via `briefings.template_id`).
