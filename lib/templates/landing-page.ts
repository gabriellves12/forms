import type { TemplateDef } from './types';

export const landingPageTemplate: TemplateDef = {
  categorySlug: 'landing-page',
  categoryName: 'Landing Page',
  intro: {
    eyebrow: 'Briefing · Think Brand',
    title: 'Vamos construir a landing page <em>que vai converter.</em>',
    description:
      'Briefing focado em performance: objetivo de conversão, oferta, público, prova social e CTA. Suas respostas viram base de copy, design e estrutura otimizada.',
    meta: [
      { value: '±8 min', label: 'tempo médio' },
      { value: '20 perguntas', label: 'uma por vez' },
      { value: 'Sem cadastro', label: '' },
    ],
    buttonLabel: 'Começar',
  },
  questions: [
    { id: 'cliente_nome', type: 'text', title: 'Qual é o seu nome?', placeholder: 'Digite seu nome completo', required: true },
    { id: 'produto_nome', type: 'text', title: 'Qual é o nome do produto / oferta que a landing vai vender?', placeholder: 'Ex: Curso Aurora', required: true },
    { id: 'descricao_oferta', type: 'textarea', title: 'Descreva a oferta em 2-3 frases.', hint: 'Como se você estivesse explicando pra um amigo.', placeholder: 'O que é, o que entrega, pra quem é...', required: true },
    { id: 'objetivo_principal', type: 'single', title: 'Qual o objetivo único da landing?', hint: 'Landing converte melhor quando tem 1 foco.', options: ['Capturar leads (email/telefone)', 'Venda direta no checkout', 'Agendar reunião / demo', 'Inscrição em evento / lista de espera', 'Download de material'], required: true },
    { id: 'meta_conversao', type: 'text', title: 'Qual a meta de conversão? (opcional)', hint: 'Ex: "10% de visitantes viram lead", "50 vendas/mês".', placeholder: 'Ex: 50 leads por semana', required: false },
    { id: 'publico_alvo', type: 'textarea', title: 'Quem é o público-alvo da oferta?', hint: 'Quanto mais específico, melhor a copy.', placeholder: 'Idade, ocupação, momento de vida, dores...', required: true },
    { id: 'dor_principal', type: 'textarea', title: 'Qual a principal dor / problema que sua oferta resolve?', placeholder: 'O que tira o sono do seu cliente antes de te encontrar?', required: true },
    { id: 'desejo_principal', type: 'textarea', title: 'E qual o principal desejo / desfecho desejado?', hint: 'Onde a vida do cliente quer chegar.', placeholder: 'Como ele se vê depois de usar sua oferta?', required: true },
    { id: 'beneficios', type: 'textarea', title: 'Liste os principais benefícios da oferta.', hint: '3 a 5 itens — foque em transformação, não em features.', placeholder: '1) ...\n2) ...\n3) ...', required: true },
    { id: 'objecoes', type: 'textarea', title: 'Quais são as principais objeções que o público costuma ter?', hint: 'Ex: preço, tempo, "isso funciona pra mim?", desconfiança.', placeholder: '1) ...\n2) ...', required: true },
    { id: 'prova_social', type: 'textarea', title: 'Você tem prova social? (depoimentos, cases, números)', hint: 'Pode listar nomes, prints, métricas — o que tiver.', placeholder: 'Ex: 3 depoimentos em vídeo + 12 escritos, "ajudei 500 clientes"...', required: false },
    { id: 'autoridade', type: 'textarea', title: 'Por que confiar em você / na sua empresa?', hint: 'Experiência, formação, prêmios, marcas atendidas.', placeholder: 'Conte sua autoridade...', required: false },
    { id: 'oferta_detalhe', type: 'textarea', title: 'Detalhes da oferta: preço, condições, bônus, garantia.', placeholder: 'R$ X em 12x, bônus inclusos, garantia de 7 dias...', required: true },
    { id: 'urgencia_escassez', type: 'text', title: 'Existe algum gatilho de urgência ou escassez?', hint: 'Ex: "vagas limitadas", "promoção até DD/MM".', placeholder: 'Ex: 30 vagas, encerra em 7 dias', required: false },
    { id: 'cta_principal', type: 'text', title: 'Qual o texto do botão principal (CTA)?', hint: 'Ex: "Quero garantir minha vaga", "Falar com especialista".', placeholder: 'Ex: Quero começar agora', required: true },
    { id: 'referencias', type: 'textarea', title: 'Cite até 3 landing pages que você admira.', hint: 'Links + o que você gosta nelas.', placeholder: 'https://... — gosto de...', required: false },
    { id: 'tom_voz', type: 'multi-other', title: 'Qual o tom de voz que a página deve ter?', options: ['Direto e urgente', 'Próximo e conversacional', 'Inspirador', 'Premium / sofisticado', 'Técnico'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'integracoes', type: 'textarea', title: 'A página precisa integrar com algum sistema?', hint: 'Ex: pixel Facebook, GA4, CRM, e-mail marketing, checkout.', placeholder: 'Liste o que precisar...', required: false },
    { id: 'prazo', type: 'single', title: 'Qual o prazo desejado?', options: ['Urgente — até 7 dias', '7 a 15 dias', '15 a 30 dias', 'Mais de 30 dias'], required: true },
    { id: 'orcamento', type: 'single', title: 'Faixa de investimento prevista?', options: ['Até R$ 3.000', 'R$ 3k – R$ 8k', 'R$ 8k – R$ 15k', 'Acima de R$ 15k', 'Ainda definindo'], required: true },
  ],
};
