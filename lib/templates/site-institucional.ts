import type { TemplateDef } from './types';

export const siteInstitucionalTemplate: TemplateDef = {
  categorySlug: 'site-institucional',
  categoryName: 'Site Institucional',
  intro: {
    eyebrow: 'Briefing · Think Brand',
    title: 'Vamos planejar o site institucional <em>da sua marca.</em>',
    description:
      'Esse briefing alinha objetivos, estrutura, conteúdo e tom de voz do seu site institucional. Suas respostas viram base de arquitetura, design e copy.',
    meta: [
      { value: '±12 min', label: 'tempo médio' },
      { value: '24 perguntas', label: 'uma por vez' },
      { value: 'Sem cadastro', label: '' },
    ],
    buttonLabel: 'Começar',
  },
  questions: [
    { id: 'cliente_nome', type: 'text', title: 'Qual é o seu nome?', hint: 'Pra usarmos durante o processo.', placeholder: 'Digite seu nome completo', required: true },
    { id: 'empresa_nome', type: 'text', title: 'Qual é o nome da empresa ou marca?', placeholder: 'Ex: Aurora Estúdio', required: true },
    { id: 'site_atual', type: 'text', title: 'Tem site atualmente? Se sim, qual o link?', hint: 'Deixe em branco se for o primeiro.', placeholder: 'https://...', required: false },
    { id: 'descricao_empresa', type: 'textarea', title: 'Em uma frase, o que sua empresa faz?', hint: 'Como você apresentaria pra alguém que nunca ouviu falar.', placeholder: '"Somos a empresa que..."', required: true },
    { id: 'historia', type: 'textarea', title: 'Conte um pouco da história da empresa.', hint: 'Como começou, há quanto tempo existe, marcos importantes.', placeholder: 'Escreva aqui...', required: true },
    { id: 'servicos', type: 'textarea', title: 'Quais serviços ou produtos serão apresentados no site?', hint: 'Liste cada um e descreva brevemente.', placeholder: '1) Serviço X — descrição\n2) Serviço Y — descrição', required: true },
    { id: 'objetivo_site', type: 'multi-other', title: 'Qual o objetivo principal do site?', hint: 'Pode selecionar mais de um.', options: ['Gerar leads / contatos', 'Mostrar portfólio', 'Vender online', 'Aumentar autoridade da marca', 'Educar o público', 'Recrutar talentos'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'objetivo_principal', type: 'multi-from-prev', title: 'Desses objetivos, qual é O mais importante?', hint: 'Escolha 1.', required: true, config: { sourceId: 'objetivo_site', max: 1, min: 1 } },
    { id: 'publico_alvo', type: 'textarea', title: 'Quem é o público-alvo do site?', placeholder: 'Pra quem ele precisa funcionar?', required: true },
    { id: 'paginas', type: 'multi-other', title: 'Quais páginas o site precisa ter?', options: ['Home', 'Sobre', 'Serviços / Produtos', 'Portfólio / Cases', 'Blog', 'Contato', 'FAQ', 'Carreira / Trabalhe conosco'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'cta_principal', type: 'text', title: 'Qual a principal ação que você quer que o visitante faça?', hint: 'Ex: "Solicitar orçamento", "Agendar uma conversa", "Comprar".', placeholder: 'Ex: Solicitar orçamento', required: true },
    { id: 'cta_secundario', type: 'text', title: 'E uma ação secundária?', hint: 'Algo que ajude quem ainda não está pronto pra ação principal.', placeholder: 'Ex: Baixar material gratuito', required: false },
    { id: 'diferenciais', type: 'textarea', title: 'Quais são os principais diferenciais da empresa?', hint: '3 a 5 pontos que destacam você do mercado.', placeholder: '1) ...\n2) ...\n3) ...', required: true },
    { id: 'concorrentes', type: 'textarea', title: 'Cite 2-3 concorrentes diretos com seus respectivos sites.', placeholder: 'Empresa X — https://...', required: false },
    { id: 'referencias', type: 'textarea', title: 'Cite até 3 sites que você admira (de qualquer segmento).', hint: 'E diga o que você gosta neles.', placeholder: 'https://... — gosto de...\nhttps://... — gosto de...', required: false },
    { id: 'tom_voz', type: 'multi-other', title: 'Qual o tom de voz que o site deve transmitir?', hint: 'Selecione até 3.', options: ['Formal', 'Próximo / conversacional', 'Técnico / especializado', 'Inspirador', 'Direto e objetivo', 'Sofisticado', 'Divertido'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'estilo_visual', type: 'multi-other', title: 'Qual estilo visual você prefere para o site?', options: ['Minimalista', 'Editorial / com bastante texto', 'Colorido e ousado', 'Premium / luxo', 'Tecnológico / futurista', 'Orgânico / artesanal'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'paleta', type: 'textarea', title: 'Tem cores obrigatórias ou referência de paleta?', hint: 'Pode citar HEX, marca de referência ou descrever.', placeholder: 'Ex: tons de azul escuro + dourado', required: false },
    { id: 'conteudo_pronto', type: 'single', title: 'Os textos (copy) do site já estão prontos?', options: ['Sim, tudo pronto', 'Parcialmente — alguns textos prontos', 'Não, precisarei de ajuda com copy'], required: true },
    { id: 'imagens', type: 'single', title: 'E as imagens / fotos?', options: ['Sim, banco próprio pronto', 'Parcialmente — algumas prontas', 'Não, precisaremos produzir / usar bancos'], required: true },
    { id: 'tecnologias_obrigatorias', type: 'textarea', title: 'Existe alguma tecnologia / ferramenta obrigatória?', hint: 'Ex: WordPress, Shopify, integração com HubSpot, plataforma específica.', placeholder: 'Deixe em branco se não tiver preferência.', required: false },
    { id: 'integracoes', type: 'textarea', title: 'O site precisa integrar com algum sistema?', hint: 'Ex: CRM, e-mail marketing, calendário, chat, pagamento.', placeholder: 'Liste o que precisar...', required: false },
    { id: 'prazo', type: 'single', title: 'Qual o prazo desejado para o lançamento?', options: ['Urgente — até 1 mês', '1 a 2 meses', '2 a 4 meses', 'Sem prazo definido'], required: true },
    { id: 'orcamento', type: 'single', title: 'Faixa de investimento prevista para o projeto?', options: ['Até R$ 10.000', 'R$ 10k – R$ 25k', 'R$ 25k – R$ 50k', 'Acima de R$ 50k', 'Ainda definindo'], required: true },
  ],
};
