# Design System — thinkbrand

**Estilo:** Moderna (monocromática)
**Família tipográfica:** Google Sans Flex 36pt (9 pesos, 100 → 900)
**Cor primária:** `#181818`
**Paleta:** Monocromática — preto / cinza / branco. Sem cor de marca colorida.

---

## 1. Paleta de cores

### Cores da marca

| Token                | HEX       | Uso recomendado                                           |
| -------------------- | --------- | --------------------------------------------------------- |
| `--tb-brand-black`   | `#0C0C0C` | Preto absoluto — máxima profundidade, backgrounds dark    |
| `--tb-brand-dark`    | `#181818` | Preto principal — texto, botões, logo positiva            |
| `--tb-brand-light`   | `#E1E1E1` | Cinza claro — texto em dark mode, backgrounds suaves      |

### Primária

| Token                       | HEX       | Uso                                            |
| --------------------------- | --------- | ---------------------------------------------- |
| `--tb-color-primary`        | `#181818` | Cor principal de botões, CTAs, destaques       |
| `--tb-color-primary-hover`  | `#0C0C0C` | Hover do botão primário                        |
| `--tb-color-primary-light`  | `#2A2A2A` | Hover em superfícies escuras (cards dark)      |
| `--tb-color-on-primary`     | `#FFFFFF` | Texto sobre a cor primária (contraste 16:1 ✅) |

### Secundária

| Token                          | HEX       | Uso                                       |
| ------------------------------ | --------- | ----------------------------------------- |
| `--tb-color-secondary`         | `#E1E1E1` | Acentos invertidos, BGs em seções claras  |
| `--tb-color-secondary-light`   | `#F5F5F5` | Versão mais clara para badges, cards      |
| `--tb-color-on-secondary`      | `#0C0C0C` | Texto sobre a secundária                  |

### Neutros (escala completa)

| Token             | HEX       | Uso típico                                  |
| ----------------- | --------- | ------------------------------------------- |
| `--tb-neutral-0`  | `#FFFFFF` | Branco puro — fundos, cards                 |
| `--tb-neutral-50` | `#FAFAFA` | Branco quebrado — fundo de página           |
| `--tb-neutral-100`| `#F5F5F5` | BGs suaves, hover em itens claros           |
| `--tb-neutral-200`| `#E1E1E1` | **Cor da marca** — bordas, dividers         |
| `--tb-neutral-300`| `#D4D4D4` | Bordas fortes                               |
| `--tb-neutral-400`| `#A3A3A3` | Texto desabilitado, placeholders            |
| `--tb-neutral-500`| `#737373` | Texto auxiliar                              |
| `--tb-neutral-600`| `#525252` | Texto secundário                            |
| `--tb-neutral-700`| `#404040` | Texto reforçado                             |
| `--tb-neutral-800`| `#262626` | Texto sobre fundos quase pretos             |
| `--tb-neutral-900`| `#181818` | **Cor da marca** — texto principal          |
| `--tb-neutral-950`| `#0C0C0C` | **Cor da marca** — fundos dark profundos    |

### Texto (papéis semânticos)

| Token                  | HEX       | Uso                                  |
| ---------------------- | --------- | ------------------------------------ |
| `--tb-text-primary`    | `#181818` | Texto principal sobre fundo claro    |
| `--tb-text-secondary`  | `#525252` | Texto auxiliar                       |
| `--tb-text-muted`      | `#A3A3A3` | Legendas, placeholders               |
| `--tb-text-inverse`    | `#FAFAFA` | Texto sobre fundos escuros           |

### Superfícies

| Token                    | HEX       | Uso                          |
| ------------------------ | --------- | ---------------------------- |
| `--tb-surface-page`      | `#FFFFFF` | Fundo da página              |
| `--tb-surface-raised`    | `#FAFAFA` | Cards, modais                |
| `--tb-surface-sunken`    | `#F5F5F5` | Inputs, áreas afundadas      |
| `--tb-surface-dark`      | `#181818` | Seções dark, navbar dark     |
| `--tb-surface-darker`    | `#0C0C0C` | Hero dark, footer            |

### Semânticas

| Token               | HEX       | Uso                |
| ------------------- | --------- | ------------------ |
| `--tb-color-success`| `#10B981` | Sucesso, confirma  |
| `--tb-color-error`  | `#EF4444` | Erro, destrutivo   |
| `--tb-color-warning`| `#F59E0B` | Alerta             |
| `--tb-color-info`   | `#3B82F6` | Informação         |

### Contraste — verificações WCAG AA

- `#181818` sobre `#FFFFFF` → **16.1:1** ✅ (texto principal)
- `#FFFFFF` sobre `#181818` → **16.1:1** ✅ (texto sobre botão primário)
- `#525252` sobre `#FFFFFF` → **7.5:1** ✅ (texto secundário)
- `#A3A3A3` sobre `#FFFFFF` → **3.4:1** ⚠️ (use só em textos não-essenciais 18px+)

---

## 2. Tipografia

### Família

**Google Sans Flex 36pt** — embarcada localmente em `/fonte/`.

Stack completa com fallback:

```css
font-family: 'Google Sans Flex', 'Google Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

### Pesos disponíveis (9 pesos)

| Peso | Nome         | Token                              | Uso típico                          |
| ---- | ------------ | ---------------------------------- | ----------------------------------- |
| 100  | Thin         | `--tb-font-weight-thin`            | Display gigante, decorativo         |
| 200  | ExtraLight   | `--tb-font-weight-extralight`      | Display sutil                       |
| 300  | Light        | `--tb-font-weight-light`           | Subtítulos delicados                |
| 400  | Regular      | `--tb-font-weight-regular`         | Corpo de texto                      |
| 500  | Medium       | `--tb-font-weight-medium`          | Subtítulos, ênfase leve             |
| 600  | SemiBold     | `--tb-font-weight-semibold`        | Botões, títulos médios              |
| 700  | Bold         | `--tb-font-weight-bold`            | Headlines, H1/H2                    |
| 800  | ExtraBold    | `--tb-font-weight-extrabold`       | Headlines de alto impacto           |
| 900  | Black        | `--tb-font-weight-black`           | Display dramático, números grandes  |

> Tamanhos de fonte e espaçamentos não são definidos aqui — eles vêm da skill `webdesigner-infoprodutos` (regra de 8 + grid de 20px).

---

## 3. Princípios visuais — estilo Moderna

### Border radius

| Token              | Valor   | Uso                                 |
| ------------------ | ------- | ----------------------------------- |
| `--tb-radius-sm`   | `8px`   | Inputs, tags pequenas               |
| `--tb-radius-md`   | `12px`  | Botões, cards padrão                |
| `--tb-radius-lg`   | `20px`  | Cards grandes, modais, seções       |
| `--tb-radius-xl`   | `28px`  | Hero cards, blocos de destaque      |
| `--tb-radius-full` | `9999px`| Pílulas, avatares, botões circulares|

### Sombras (com profundidade)

| Token              | Valor                                | Uso                       |
| ------------------ | ------------------------------------ | ------------------------- |
| `--tb-shadow-xs`   | `0 1px 2px rgba(12,12,12,0.04)`      | Inputs, divisões sutis    |
| `--tb-shadow-sm`   | `0 2px 4px rgba(12,12,12,0.06)`      | Cards parados             |
| `--tb-shadow-md`   | `0 4px 12px rgba(12,12,12,0.08)`     | Cards em hover            |
| `--tb-shadow-lg`   | `0 10px 30px rgba(12,12,12,0.12)`    | Modais, popovers          |
| `--tb-shadow-xl`   | `0 20px 50px rgba(12,12,12,0.18)`    | Hero elevado              |
| `--tb-shadow-2xl`  | `0 30px 80px rgba(12,12,12,0.25)`    | Drama máximo, drops       |

### Gradientes (monocromáticos)

| Token                  | Valor                                              | Uso                                   |
| ---------------------- | -------------------------------------------------- | ------------------------------------- |
| `--tb-gradient-dark`   | `linear-gradient(135deg, #181818 0%, #0C0C0C)`     | Hero dark, botões premium             |
| `--tb-gradient-light`  | `linear-gradient(135deg, #FAFAFA 0%, #E1E1E1)`     | Seções suaves                         |
| `--tb-gradient-fade`   | `linear-gradient(180deg, transparent 0%, #0C0C0C)` | Overlay sobre imagens (legibilidade)  |
| `--tb-gradient-radial` | `radial-gradient(circle at top right, #2A2A2A, #0C0C0C)` | BGs com ponto de luz           |

---

## 4. Como usar

### 1. Importar os tokens no projeto

No `<head>` do seu HTML (ou no topo do CSS principal):

```html
<link rel="stylesheet" href="./tokens.css" />
```

### 2. Aplicar no body

```css
body {
  font-family: var(--tb-font-family-primary);
  font-weight: var(--tb-font-weight-regular);
  color: var(--tb-text-primary);
  background: var(--tb-surface-page);
}
```

### 3. Exemplos prontos

**Botão primário:**
```css
.btn-primary {
  background: var(--tb-color-primary);
  color: var(--tb-color-on-primary);
  font-weight: var(--tb-font-weight-semibold);
  padding: 14px 28px;
  border-radius: var(--tb-radius-md);
  box-shadow: var(--tb-shadow-md);
  transition: all 200ms ease-out;
}
.btn-primary:hover {
  background: var(--tb-color-primary-hover);
  box-shadow: var(--tb-shadow-lg);
  transform: translateY(-1px);
}
```

**Card padrão:**
```css
.card {
  background: var(--tb-surface-raised);
  border: 1px solid var(--tb-border-subtle);
  border-radius: var(--tb-radius-lg);
  padding: 32px;
  box-shadow: var(--tb-shadow-sm);
}
```

**Hero dark com gradiente:**
```css
.hero-dark {
  background: var(--tb-gradient-radial);
  color: var(--tb-text-inverse);
  border-radius: var(--tb-radius-xl);
  padding: 80px 40px;
}
```

---

## 5. Assets da marca

| Arquivo            | Descrição                                                |
| ------------------ | -------------------------------------------------------- |
| `logo01.svg`       | Logo "thinkbrand" — versão **clara** (`#E1E1E1`)         |
| `logo02.svg`       | Logo "thinkbrand" — versão **escura** (`#181818`)        |
| `icon01.svg`       | Ícone "B" (símbolo) — versão clara (`#E1E1E1`)           |
| `icon02.svg`       | Ícone "B" (símbolo) — versão escura (`#181818`)          |
| `palletecolor.svg` | Paleta de referência (3 cores: cinza, preto, preto escuro) |
| `fonte/`           | Pasta com Google Sans Flex 36pt (9 pesos `.ttf`)         |

**Regra:** logo clara sobre fundo escuro, logo escura sobre fundo claro. Mesma regra para os ícones.

---

## 6. Próximo passo

Design system pronto. Para construir páginas de lançamento (captura, vendas, obrigado, checkout) usando essa identidade, chame a skill **`webdesigner-infoprodutos`** (`WebSkill01.md`) — ela consome esses tokens diretamente e aplica:
- Tamanhos de fonte na regra de 8 (16, 24, 32, 40, 48)
- Espaçamento em grid de 20px (35px na primeira dobra)
- Container central 1280px desktop / 360px mobile
- Layout obrigatório da primeira dobra (texto à esquerda, expert à direita)
- Animações em todas as dobras
