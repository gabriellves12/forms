---
name: designsystem-criador
description: Cria um design system completo para projetos de infoprodutos — paleta de cores, tipografia e princípios visuais — a partir de uma entrevista inicial obrigatória com o usuário. Use sempre que o usuário pedir para iniciar um novo projeto, criar uma identidade visual, montar um design system, definir cores e fontes, ou começar uma página/site/lançamento sem ter um design system já definido. Use também proativamente antes de qualquer skill de webdesign (como `webdesigner-infoprodutos`) quando o design system ainda não existir. A skill conduz a entrevista, monta a paleta com variantes, define a tipografia com pesos e entrega tokens prontos para uso em CSS/WordPress/Elementor.
---

# Criador de Design System para Infoprodutos

## O que esta skill faz

Esta skill é a **etapa zero** de qualquer projeto visual. Ela transforma 3 informações brutas do usuário em um **design system estruturado e pronto para ser consumido** por outras skills (especialmente a `webdesigner-infoprodutos`).

Entrega final:

- **Paleta de cores completa** — primárias, secundárias, neutras e semânticas, com variantes (hover, light, dark) e códigos HEX
- **Tipografia definida** — família(s), pesos disponíveis e papel de cada uma (display, corpo, auxiliar)
- **Princípios visuais** — derivados do estilo escolhido (tech, minimalista, elegante, moderna…)
- **Tokens em CSS variables** — prontos para colar em qualquer projeto

> A skill **não cria a logo**. Logo é responsabilidade do cliente ou de um designer gráfico. A skill apenas pergunta se já existe e adapta a paleta para conviver bem com ela.

---

## ⚠️ Regra de ouro: nunca pule a entrevista

**Antes de gerar qualquer cor, qualquer fonte, qualquer linha de CSS, a entrevista inicial é obrigatória.** Mesmo que o usuário diga "manda ver" ou "faz o que achar melhor", pare e faça as 3 perguntas. Um design system sem inputs do dono do projeto é um chute — e chute não cabe aqui.

Se o usuário recusar a entrevista, ofereça **opções pré-prontas** (ex: "tenho 3 paletas de referência para o estilo Tech, quer escolher uma?") em vez de inventar do zero.

---

## Etapa 1 — Entrevista inicial obrigatória

Faça **as 3 perguntas abaixo, nessa ordem**, em uma única mensagem para o usuário. Não avance enquanto não tiver resposta para todas.

### Pergunta 1 — Cores de preferência
> "Quais cores você quer no seu projeto? Pode me dizer de várias formas:
> - Códigos HEX (ex: `#0066FF`, `#1A1A1A`)
> - Nomes (ex: 'azul royal', 'verde menta')
> - Referências (ex: 'as cores da Nubank', 'a paleta do Notion')
> - Sentimento (ex: 'algo quente e acolhedor')"

Aceite qualquer formato. Se vier nome ou sentimento, **converta você mesmo em HEX** na hora de construir a paleta (etapa 2).

### Pergunta 2 — Fontes
> "Qual fonte você quer usar? Algumas formas de responder:
> - Nome da fonte (ex: 'Inter', 'Poppins', 'Playfair Display')
> - Estilo geral (ex: 'sans-serif moderna', 'serif elegante', 'display marcante')
> - Referência (ex: 'parecido com a Apple', 'tipo Medium')
> - 'Não sei, sugere você' — nesse caso, recomende 2-3 opções no estilo escolhido na pergunta 3."

Sempre priorize fontes do **Google Fonts** (gratuitas e fáceis de embarcar em WordPress).

### Pergunta 3 — Estilo visual
> "Qual estilo visual combina com o projeto? Escolha um (ou misture 2):
> - **Tech** — tecnológica, geométrica, cores frias, sensação de produto digital
> - **Minimalista** — muita respiração, poucos elementos, neutros dominantes
> - **Elegante** — sofisticada, sóbria, contraste sutil, ar premium
> - **Moderna** — vibrante, ousada, cores saturadas, sensação de novidade
> - **Outro** — me descreve com suas palavras"

Esse é o input mais importante: ele **direciona todas as decisões secundárias** (que neutro usar, o quão arredondadas as bordas devem ser, peso da fonte padrão etc).

---

## Etapa 2 — Construção da paleta de cores

A partir da(s) cor(es) que o usuário deu, monte uma **paleta completa** com a estrutura abaixo. Nunca entregue só a cor que o usuário pediu — sempre expanda.

### Estrutura padrão da paleta

| Categoria | O que é | Quantas cores |
|---|---|---|
| **Primária** | A cor principal da marca (botões, CTAs, destaques) | 1 cor + 2 variantes (hover, light) |
| **Secundária** | Cor de apoio (acentos, ícones, fundos suaves) | 1 cor + 1 variante |
| **Neutras** | Pretos, brancos e cinzas | 5 a 7 tons (do mais claro ao mais escuro) |
| **Semânticas** | Sucesso, erro, alerta, info | 4 cores fixas |

### Como gerar cada variante

- **Hover** da primária: escureça a primária em ~10% (em HSL, reduza Lightness em 10).
- **Light** da primária: clareie a primária em ~85-90% (use para fundos suaves, badges, hover de cards). Em HSL, aumente Lightness até ~92%.
- **Neutras**: ajuste o tom conforme o estilo (veja etapa 4). Tech tende a cinza levemente azulado; elegante tende a cinza levemente quente.
- **Semânticas padrão** (use estas como ponto de partida e ajuste a saturação para combinar com o estilo):
  - Sucesso: `#10B981` (verde)
  - Erro: `#EF4444` (vermelho)
  - Alerta: `#F59E0B` (âmbar)
  - Info: `#3B82F6` (azul)

### Verificação obrigatória — contraste

Antes de fechar a paleta, verifique mentalmente o contraste:

- Texto principal sobre fundo claro: **mínimo 4.5:1** (WCAG AA)
- Texto sobre o botão da cor primária: **mínimo 4.5:1**
- Se a primária for muito clara, defina explicitamente que o texto sobre ela é escuro (e vice-versa).

### Formato de saída da paleta

Sempre entregue assim (exemplo com primária azul tech):

```css
:root {
  /* Primária */
  --color-primary: #0066FF;
  --color-primary-hover: #0052CC;
  --color-primary-light: #E6F0FF;

  /* Secundária */
  --color-secondary: #6B46C1;
  --color-secondary-light: #EDE7F8;

  /* Neutras */
  --color-neutral-900: #0F172A;  /* texto principal */
  --color-neutral-700: #334155;  /* texto secundário */
  --color-neutral-500: #64748B;  /* texto auxiliar */
  --color-neutral-300: #CBD5E1;  /* bordas */
  --color-neutral-100: #F1F5F9;  /* fundos suaves */
  --color-neutral-0:   #FFFFFF;  /* branco / cards */

  /* Semânticas */
  --color-success: #10B981;
  --color-error:   #EF4444;
  --color-warning: #F59E0B;
  --color-info:    #3B82F6;
}
```

---

## Etapa 3 — Definição da tipografia

A partir da resposta da pergunta 2 (e cruzando com o estilo da pergunta 3), defina:

### Família(s)

- **Uma família só** é o caminho mais seguro e moderno (usa pesos diferentes para hierarquia).
- **Duas famílias** (uma display + uma corpo) só quando o estilo for "elegante" ou quando o usuário pedir explicitamente.

### Pesos obrigatórios

Sempre defina **no mínimo** estes pesos (todos devem ser baixados/embarcados):

- `400` — Regular (corpo de texto)
- `500` — Medium (subtítulos, ênfase leve)
- `600` — Semibold (botões, títulos médios)
- `700` — Bold (headlines, H1/H2)

Se o estilo for **display/moderno**, adicione também `800` ou `900` para headlines impactantes.

### Sugestões por estilo (use se o usuário pedir recomendação)

| Estilo | Família principal recomendada | Alternativa |
|---|---|---|
| Tech | Inter, Space Grotesk | Manrope |
| Minimalista | Inter, Söhne (paga) | DM Sans |
| Elegante | Playfair Display (títulos) + Inter (corpo) | Cormorant + Lato |
| Moderna | Poppins, Sora | Plus Jakarta Sans |

### Formato de saída da tipografia

```css
:root {
  --font-family-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-display: 'Inter', system-ui, sans-serif; /* mesma se for família única */

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

E o `<link>` do Google Fonts pronto para colar:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

> **Importante:** esta skill define **família e pesos**. **Tamanhos de fonte** (regra de 8) e **espaçamento** (grid de 20px) são decisões da skill `webdesigner-infoprodutos`. Não invada o território dela.

---

## Etapa 4 — Estilo visual → princípios concretos

A resposta da pergunta 3 não é decorativa: ela vira **regras técnicas**. Use a tabela abaixo para traduzir o estilo escolhido em decisões concretas que afetam toda a paleta e a aparência geral.

| Decisão | Tech | Minimalista | Elegante | Moderna |
|---|---|---|---|---|
| **Saturação das cores** | Média-alta, tons frios | Baixa, dessaturada | Baixa, tons sóbrios | Alta, vibrante |
| **Neutros** | Cinza azulado (`#0F172A`, `#64748B`) | Cinza neutro puro (`#171717`, `#737373`) | Cinza quente (`#1C1917`, `#78716C`) | Cinza neutro com leve viés frio |
| **Bordas (border-radius)** | 4-8px | 0-4px | 2-6px | 12-20px (mais arredondado) |
| **Sombras** | Discretas, com tinta da primária | Sem sombras ou bem sutis | Sombras suaves, longas | Sombras coloridas, com profundidade |
| **Gradientes** | Sutis, mesma matriz de cor | Evitar | Evitar (ou monocromáticos) | Bem-vindos, com 2-3 cores |
| **Peso padrão do corpo** | 400 | 400 | 400 | 400 ou 500 |
| **Peso padrão de títulos** | 600-700 | 500-600 | 700 (ou serif regular) | 700-800 |

### Tokens de borda e sombra (entregue junto com cores e fontes)

Exemplo para estilo **moderna**:

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 30px rgba(0, 102, 255, 0.15); /* sombra com tinta da primária */
}
```

---

## Etapa 5 — Pergunta opcional sobre logo

Depois das 3 perguntas obrigatórias, pergunte (em mensagem separada, depois de já ter a paleta esboçada):

> "Você já tem uma logo? Se sim, me manda ela (ou descreve as cores dela). Se ainda não tiver, sem problema — vou indicar a paleta de jeito que funcione bem com qualquer logo que você criar depois."

Se a logo existir e tiver cores próprias:
- Ajuste a paleta para **harmonizar com a logo**, não brigar com ela.
- Documente as cores exatas da logo dentro do design system (`--color-brand-logo-primary`, etc).

Se não houver logo ainda:
- Siga com a paleta normal.
- Aponte que a logo, quando vier, deve respeitar os neutros já definidos (preto/branco/cinza).

---

## Etapa 6 — Formato de entrega do design system

Entregue **um arquivo único** (markdown ou CSS, conforme o usuário pedir) contendo:

1. **Resumo executivo** — 2-3 linhas: "Design system [nome do projeto]. Estilo [tech/minimalista/...]. Família tipográfica: [nome]. Cor primária: [hex]."
2. **Paleta completa** — tabela com nome, HEX e uso recomendado de cada cor.
3. **Tipografia** — família, pesos e link do Google Fonts.
4. **Princípios visuais** — bordas, sombras, gradientes (conforme etapa 4).
5. **Bloco de CSS variables** — `:root { ... }` completo, pronto para colar.
6. **Bloco `<link>` do Google Fonts** — pronto para colar no `<head>`.

### Template do arquivo final

```markdown
# Design System — [Nome do Projeto]

**Estilo:** [tech / minimalista / elegante / moderna]
**Família tipográfica principal:** [Inter / Poppins / ...]
**Cor primária:** [#HEX]

## 1. Paleta de cores
[tabela]

## 2. Tipografia
[família + pesos + link Google Fonts]

## 3. Princípios visuais
[bordas, sombras, gradientes]

## 4. CSS variables
[bloco :root { ... }]

## 5. Como usar
- Para qualquer página/landing/seção, **importe as variáveis CSS** acima.
- Para construir páginas de lançamento, use a skill `webdesigner-infoprodutos` — ela consome este design system diretamente.
```

---

## Integração com `webdesigner-infoprodutos`

Esta skill é a **fornecedora oficial** da skill `webdesigner-infoprodutos`. O encaixe é:

| O que `designsystem-criador` entrega | O que `webdesigner-infoprodutos` consome |
|---|---|
| Paleta com HEX e variantes | Cores das dobras, CTAs, fundos |
| Família + pesos da fonte | Aplicação dos tamanhos (regra de 8) |
| Princípios (border-radius, sombra) | Estilo dos botões, cards, blocos |
| Info da logo (se houver) | Logo na primeira dobra |

Ao final desta skill, **diga ao usuário** explicitamente:

> "✅ Design system pronto. Agora você pode pedir uma página de lançamento (captura, vendas, etc) que eu vou usar essas cores, essa fonte e esses princípios. Manda o que quer construir."

---

## Fluxo de trabalho — resumo

1. **Não comece a gerar nada** antes da entrevista.
2. **Faça as 3 perguntas obrigatórias** em uma única mensagem.
3. **Construa a paleta completa** (não só a cor que o usuário pediu).
4. **Defina tipografia** com família + pesos + link do Google Fonts.
5. **Aplique os princípios do estilo escolhido** (bordas, sombras, neutros).
6. **Pergunte sobre a logo** depois de já ter um esboço.
7. **Entregue o arquivo único** com tudo dentro, incluindo o bloco de CSS variables.
8. **Avise o usuário** que agora pode chamar a skill de webdesign.

---

## Checklist final antes de entregar

- [ ] As 3 perguntas obrigatórias foram feitas e respondidas
- [ ] Paleta tem primária + variantes (hover, light)
- [ ] Paleta tem secundária + variante
- [ ] Paleta tem 5-7 tons de neutros (compatíveis com o estilo)
- [ ] Paleta tem as 4 cores semânticas
- [ ] Contraste do texto sobre cores principais foi verificado (≥4.5:1)
- [ ] Tipografia tem família definida + 4 pesos no mínimo (400, 500, 600, 700)
- [ ] Link do Google Fonts foi gerado
- [ ] Border-radius, sombras e gradientes seguem o estilo escolhido
- [ ] Pergunta sobre logo foi feita
- [ ] Arquivo final entregue em formato único (markdown ou CSS)
- [ ] Bloco `:root { ... }` com CSS variables está pronto para colar
- [ ] Mensagem final aponta para a próxima skill (`webdesigner-infoprodutos`)
