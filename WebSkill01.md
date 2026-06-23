---
name: webdesigner-infoprodutos
description: Webdesigner especializado na criação de páginas de lançamento de infoprodutos — páginas de captura, páginas de vendas, páginas de obrigado e checkout. Use sempre que o usuário pedir para criar, projetar, estruturar ou diagramar uma página de lançamento, página de vendas, landing page, página de captura, página de oferta, ou qualquer página voltada para conversão de produto digital — mesmo quando ele não usar a palavra "infoproduto" explicitamente. Cobre estruturação por dobras, tipografia em regra de 8, espaçamento em grid de 20px, layout-padrão da primeira dobra (texto à esquerda + imagem do expert à direita), animações obrigatórias e compatibilidade com WordPress / Elementor.
---

# Webdesigner para Páginas de Lançamento de Infoprodutos

## O que esta skill faz

Cria páginas de lançamento de infoprodutos seguindo um sistema próprio de UX/UI:

- Estrutura por **dobras** (cada seção com um único objetivo de comunicação)
- **Container responsivo** com 1280px em desktop e 360px em mobile (referência)
- Tipografia em **regra de 8** (múltiplos de 8 para tamanhos de fonte)
- Espaçamento em **grid de 20px** (entre dobras) e **35px** (dentro da primeira dobra)
- Primeira dobra com **layout fixo**: texto à esquerda, imagem do expert à direita
- **Animações em todas as dobras** para dar dinamismo
- HTML/CSS **portável para WordPress e Elementor**

Use esta skill sempre que precisar projetar uma página de lançamento — não pule etapas. O sistema abaixo existe para garantir consistência, ritmo visual e conversão.

---

## ⚠️ Pré-requisito obrigatório: Design System

Esta skill **não inicia um projeto sem um design system definido**. O design system é a fonte da verdade para **cores, tipografia (família e pesos) e logo** — e deve estar pronto antes desta skill ser invocada.

### O que o design system fornece (entrada obrigatória)
- **Paleta de cores** — primárias, secundárias, neutras, cores semânticas (sucesso, erro, CTA)
- **Tipografia** — família(s) da fonte, pesos disponíveis (regular, medium, bold etc.) e estilo (serif, sans, display)
- **Logo** — variantes (positiva, negativa, monocromática), tamanhos mínimos e área de respiro

### O que a skill define (saída — decisões próprias)
- **Tamanhos** de fonte (regra de 8 → 16, 24, 32, 40, 48)
- **Espaçamento** entre dobras e dentro de blocos (grid de 20px, 35px na primeira dobra)
- **Hierarquia visual** das dobras
- **Layout** (especialmente o padrão da primeira dobra)
- **Animações**
- **Estrutura HTML/CSS** para WordPress/Elementor

### Antes de começar — sempre verifique:

Pergunte ao usuário (ou confirme nos arquivos do projeto):

1. Qual é a paleta de cores? (códigos HEX/RGB de cada cor)
2. Qual é a família tipográfica e quais pesos estão disponíveis?
3. Onde está a logo e quais variantes existem?

**Se qualquer um desses três itens estiver faltando, pare e peça antes de codar uma única linha.** A skill não inventa cor, não escolhe fonte e não desenha logo — esses são produtos do design system, decididos em uma etapa anterior do projeto.

---

## 1. Estrutura por dobras

Toda página de lançamento é organizada em **dobras** (sections). Cada dobra tem **um único objetivo de comunicação** — nunca empilhe duas mensagens diferentes na mesma dobra.

### Dobras mais comuns em uma página de vendas

1. **Primeira dobra** — headline + subheadline + CTA + imagem do expert (above-the-fold)
2. **Para quem é / dores** — público-alvo e problema
3. **Solução / método** — o que o produto entrega
4. **Sobre o expert** — autoridade, prova social
5. **Conteúdo / módulos** — o que está incluso
6. **Bônus**
7. **Depoimentos / prova social**
8. **Garantia**
9. **FAQ**
10. **CTA final / oferta com escassez**

> A composição muda conforme o tipo de página (captura, vendas, obrigado, checkout), mas o princípio é o mesmo: **uma dobra, um objetivo**. Antes de começar a desenhar, liste as dobras que a página vai ter.

---

## 2. Tipografia — regra de 8

> **Família e pesos da fonte vêm do design system.** Esta seção define apenas os **tamanhos** — que sempre seguem múltiplos de 8.

Tamanhos de fonte sempre são **múltiplos de 8** (8, 16, 24, 32, 40, 48). Isso mantém a hierarquia previsível e o ritmo visual consistente entre todas as dobras.

### H1
- **Tamanho padrão:** `48px`
- **Quando a copy for longa:** desce para `40px`
- **Princípio:** quanto maior a copy, menor a fonte. A headline não deve passar de 2-3 linhas.

### H2
- **Tamanho máximo:** `24px`
- **Pode descer para:** `16px` conforme o uso
- Use H2 para títulos de seção e subheadlines de apoio.

### Corpo de texto e auxiliares
- **Corpo:** `16px` ou `18px`
- **Legendas / texto auxiliar:** `14px` (exceção tolerada para acessibilidade)

---

## 3. Container e responsividade

Toda página segue um **container central** com largura controlada:

### Desktop
- **Largura do conteúdo:** `1280px` (max-width).
- O container fica **centralizado** na tela (`margin: 0 auto`).
- Acima de 1280px de viewport, a página tem áreas vazias nas laterais — isso é proposital, não estique o conteúdo.

### Mobile
- **Largura do conteúdo:** `360px` (referência de design).
- O container ocupa 100% do viewport, com padding lateral preservando o respiro.
- A maior parte do tráfego de lançamento é mobile — projete pensando em 360px primeiro e depois adapte para desktop.

### Breakpoints
- **Mobile:** até `767px`
- **Tablet (opcional):** `768px` a `1023px` — adaptação intermediária
- **Desktop:** `1024px` em diante, com conteúdo travado em `1280px`

### Implementação recomendada
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px; /* respiro lateral em mobile */
}

@media (min-width: 1024px) {
  .container {
    padding: 0 40px;
  }
}
```

Cada `<section>` (dobra) usa esse container internamente. A `<section>` em si pode ter background full-width (cor, imagem, gradiente), mas o **conteúdo dentro dela sempre obedece ao container de 1280px**.

> ⚠️ **Sobre encostar no grid:** quando o cliente solicitar, **apenas blocos de conteúdo (texto)** podem encostar nas bordas do grid de 1280px — geralmente na primeira dobra, alinhados à esquerda. **Imagens nunca encostam** no grid, mesmo nessa composição. Veja a seção 5 para detalhes.

### Imagens — sempre responsivas (incluindo BG)

**Toda imagem da página precisa se adaptar ao viewport — sem exceção.** Isso vale para imagens de conteúdo (`<img>`), imagens decorativas E imagens de fundo (background-image). Se a imagem corta feio, perde o foco ou estoura o layout entre 1280px (desktop) e 360px (mobile), ela **não está responsiva** e precisa ser corrigida.

**Imagens de conteúdo (`<img>`):**
- Sempre com `max-width: 100%` e `height: auto`.
- Use `object-fit: cover` ou `contain` quando precisar controlar recorte ou ajuste.
- Para imagens críticas (hero, expert, capas de módulo), forneça `srcset` com 2-3 resoluções diferentes.
- Sempre com `alt` descritivo (acessibilidade + SEO).

**Imagens de fundo (`background-image` / BG):**
- Use `background-size: cover` (preenche a área) ou `contain` (cabe inteira), conforme o caso.
- Defina `background-position` para controlar o foco (`center`, `top center`, etc.).
- **Quando o BG não funciona bem cropado em mobile, troque a imagem via media query.** Um BG pensado para desktop (horizontal) raramente fica bom em 360px (vertical).
- Sempre tenha uma **versão otimizada para mobile** dos BGs principais (hero, sessões com imagem de fundo forte).

**Exemplo — BG responsivo com troca de imagem em mobile:**

```css
.dobra-hero {
  background-image: url('hero-desktop.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

@media (max-width: 767px) {
  .dobra-hero {
    background-image: url('hero-mobile.jpg');
    background-position: top center;
  }
}
```

**Exemplo — `<img>` responsiva com srcset:**

```html
<img
  src="expert-1x.jpg"
  srcset="expert-1x.jpg 1x, expert-2x.jpg 2x"
  alt="Foto do expert João Silva"
  style="max-width: 100%; height: auto;"
/>
```

---

## 4. Espaçamento

### Entre dobras
- **Padrão:** 80px a 100px de distância vertical entre uma dobra e outra (somando padding-top + padding-bottom da seção, ou margin entre seções).
- **Grid:** sempre **múltiplos de 20px** (60, 80, 100, 120). Nunca quebre esse grid — ele garante o ritmo de respiração da página.

### Dentro da primeira dobra
- **Distância entre blocos:** `35px` entre logo, headline, subheadline, botão e demais elementos.
- Este é o **único lugar** onde quebramos a regra de 20px. O 35px abre o respiro necessário para a primeira impressão respirar.

### Padding interno das dobras
- Em desktop: pelo menos `40px` de padding lateral.
- Em mobile: `20px` ou `24px` de padding lateral.

---

## 5. Primeira dobra — layout obrigatório

A primeira dobra segue um **padrão fixo de composição** (texto à esquerda, imagem do expert à direita, 35px entre blocos verticais). A decisão de **encostar o bloco no grid** é opcional — veja regras abaixo.

```
┌──────────────────────────────────────────────┐  ← Grid: 1280px
│┌─────────────────┐                           │
││ [Logo]          │                           │
││                 │                           │
││ Headline (H1)   │       [Imagem do          │
││                 │        Expert]            │
││ Subheadline(H2) │                           │
││                 │                           │
││ [Botão CTA]     │                           │
│└─────────────────┘                           │
└──────────────────────────────────────────────┘
 ↑
 Bloco de conteúdo PODE encostar
 na borda esquerda do grid
 (quando o usuário/cliente desejar)
```

### Regra geral sobre "encostar no grid"

**Apenas blocos de conteúdo (texto, CTA, agrupamentos textuais) podem encostar nas bordas do grid de 1280px — e apenas quando o usuário/cliente solicitar essa composição.** Imagens, ilustrações e elementos visuais **não encostam** no grid: seguem o posicionamento normal dentro do container, respeitando o padding lateral padrão.

- ✅ Permitido (quando desejado): bloco de conteúdo da primeira dobra encostado na borda esquerda
- ❌ Não fazer: imagem do expert encostada na borda direita
- ❌ Não fazer: imagens decorativas, ícones ou backgrounds encostando no grid

Se o cliente não pedir essa composição, mantenha o padding lateral normal do container (40px desktop / 24px mobile) também na primeira dobra.

### Regras de composição

- **Texto à esquerda** (logo, H1, subheadline, CTA empilhados de cima para baixo).
- **Imagem do expert à direita**, dentro do container, **sem encostar na borda direita do grid** — respeita o padding lateral normal.
- **35px entre cada bloco** vertical dentro do bloco de conteúdo (logo → H1 → subheadline → CTA).
- **Texto sempre alinhado à esquerda** dentro do bloco de conteúdo.
- **Imagem do expert** em PNG com fundo recortado quando possível, ou JPG com fundo coerente com o design system.
- Em **mobile** (referência 360px): empilha — bloco de conteúdo em cima, imagem do expert embaixo. O padding lateral normal sempre vale em mobile, mesmo quando o cliente pediu o "encostado" em desktop.

### Implementação recomendada (desktop)

**Composição padrão (com padding normal):**

```css
.dobra-hero .container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px; /* padding lateral normal */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Composição com bloco de conteúdo encostado à esquerda (quando o cliente pedir):**

```css
.dobra-hero .container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dobra-hero .imagem-expert {
  margin-right: 40px; /* imagem mantém respiro da borda direita — não encosta */
}

@media (max-width: 1023px) {
  .dobra-hero .container {
    padding: 0 24px; /* padding sempre volta em mobile/tablet */
    flex-direction: column;
  }
  .dobra-hero .imagem-expert {
    margin-right: 0;
  }
}
```

---

## 6. Animações — obrigatórias

Toda página deve ser dinâmica. Aplique animações em:

- **Entrada de cada dobra** ao entrar no viewport: fade-in + slide-up suave (400-600ms, ease-out).
- **CTA principal:** micro-animação contínua (pulse leve) ou hover scale (1.05).
- **Imagem do expert:** leve flutuação ou parallax discreto.
- **Headline:** opcional — efeito de reveal palavra por palavra, conforme o tom da campanha.
- **Listas (módulos, bônus):** stagger — elementos aparecem em sequência, não todos juntos.
- **Números / métricas:** count-up animado quando entrar no viewport.

**Bibliotecas recomendadas** (todas compatíveis com WordPress/Elementor):
- **CSS puro** com `@keyframes` — sempre o ponto de partida
- **AOS (Animate On Scroll)** — leve e fácil de integrar
- **GSAP** — quando precisar de animação mais sofisticada
- **Animações nativas do Elementor** — quando a entrega final for direto no builder

---

## 7. Compatibilidade com WordPress / Elementor

A página final será reconstruída no Elementor ou colada como HTML no WordPress. Portanto, na hora de codar:

- **HTML semântico e modular** — cada dobra em uma `<section>` independente, com classe própria (ex: `.dobra-hero`, `.dobra-modulos`, `.dobra-faq`).
- **CSS escopado por seção** — evite seletores globais (`*`, `body`, `h1` sem classe) que possam vazar para o tema do WordPress.
- **Imagens otimizadas** — WebP ou JPG comprimido. Sempre com `alt` descritivo.
- **Sem dependências de build** — nada de React, Vue, Tailwind via build. Use HTML, CSS e JS puros (ou Tailwind via CDN, com aviso).
- **Fontes via Google Fonts** ou já embarcadas pelo tema do cliente.
- **Mobile-first** — a maior parte do tráfego de lançamento vem do celular.
- **IDs e classes em kebab-case** — facilita ser importado/lido no Elementor.

---

## 8. Fluxo de trabalho ao receber um pedido

Quando o usuário pedir uma página, siga esta ordem:

1. **Verifique o design system primeiro.** Confirme que tem em mãos: paleta de cores, família tipográfica + pesos, e a logo. **Se faltar qualquer um, pare aqui e peça.** Não avance sem isso.
2. **Pergunte ou confirme** o tipo da página: captura, vendas, obrigado, checkout, etc.
3. **Liste as dobras** que a página vai ter (proponha um esqueleto e confirme antes de codar).
4. **Confirme assets específicos** dessa página: foto do expert, imagens de bônus, ícones, vídeos.
5. **Codifique uma dobra por vez**, validando o resultado visual antes de avançar — sempre usando as variáveis CSS do design system (cores e fontes) e os tamanhos/espacamentos definidos nesta skill.
6. **Entregue o HTML/CSS final** estruturado em `<section>` independentes, pronto para colar no Elementor ou WordPress.

---

## Checklist final antes de entregar

- [ ] **Design system aplicado** — cores, fonte e logo usados são os definidos pelo design system do projeto (sem cores ou fontes inventadas)
- [ ] **Container central** com `max-width: 1280px` em desktop, centralizado
- [ ] **Mobile** projetado em referência de 360px, ocupando 100% do viewport com padding lateral
- [ ] Cada dobra é uma `<section>` semântica e independente
- [ ] H1 em 48px ou 40px (conforme tamanho da copy)
- [ ] H2 no máximo 24px
- [ ] Todos os tamanhos de fonte são múltiplos de 8
- [ ] Espaçamento entre dobras: 80-100px, múltiplo de 20px
- [ ] **Primeira dobra:** texto à esquerda, imagem do expert à direita, 35px entre blocos verticais
- [ ] **"Encostar no grid"** aplicado apenas a blocos de conteúdo (não a imagens) e somente quando o cliente solicitar
- [ ] Animações de entrada em todas as dobras
- [ ] CTA com micro-animação (pulse ou hover)
- [ ] Layout responsivo (desktop, tablet, mobile)
- [ ] HTML/CSS sem dependências de build, pronto para Elementor/WordPress
- [ ] **Todas as imagens são responsivas** — incluindo backgrounds (BG), sem cortar feio ou estourar entre 1280px e 360px
- [ ] BGs principais têm versão otimizada para mobile (troca via media query quando necessário)
- [ ] Imagens `<img>` com `max-width: 100%`, `height: auto` e `alt` descritivo
