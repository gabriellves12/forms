import type { TemplateDef } from './types';

export const copyTemplate: TemplateDef = {
  categorySlug: 'copy',
  categoryName: 'Copy',
  intro: {
    eyebrow: 'Briefing · Think Brand',
    title: 'Vamos escrever a copy <em>que conecta e converte.</em>',
    description:
      'Briefing pra qualquer entrega de copy: site, landing, anúncio, e-mail, social. Quanto mais detalhe sobre marca, público e oferta, melhor a escrita.',
    meta: [
      { value: '±10 min', label: 'tempo médio' },
      { value: '22 perguntas', label: 'uma por vez' },
      { value: 'Sem cadastro', label: '' },
    ],
    buttonLabel: 'Começar',
  },
  questions: [
    { id: 'cliente_nome', type: 'text', title: 'Qual é o seu nome?', placeholder: 'Digite seu nome completo', required: true },
    { id: 'marca_nome', type: 'text', title: 'Qual é o nome da marca / empresa?', placeholder: 'Ex: Aurora', required: true },
    { id: 'tipo_entrega', type: 'multi-other', title: 'Que tipo de copy você precisa?', hint: 'Pode marcar mais de um.', options: ['Copy de site', 'Copy de landing page', 'Anúncios (Meta/Google)', 'E-mail marketing / sequência', 'Roteiros de vídeo', 'Posts de redes sociais', 'Copy de e-commerce (produto)', 'Naming / Slogan'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'volume', type: 'textarea', title: 'Qual o volume da entrega?', hint: 'Ex: "5 páginas de site", "3 anúncios + 1 landing", "sequência de 7 emails".', placeholder: 'Detalhe quantidade e formato...', required: true },
    { id: 'descricao_oferta', type: 'textarea', title: 'Descreva o produto / serviço que será o foco da copy.', hint: 'O que é, como funciona, o que entrega.', placeholder: 'Escreva aqui...', required: true },
    { id: 'objetivo', type: 'single', title: 'Qual o objetivo principal da copy?', options: ['Gerar leads', 'Vender direto', 'Educar / nutrir audiência', 'Posicionar a marca', 'Engajar nas redes sociais', 'Reativar base inativa'], required: true },
    { id: 'publico_alvo', type: 'textarea', title: 'Quem é o público-alvo?', hint: 'Seja específico: idade, profissão, contexto, dores.', placeholder: 'Descreva o leitor ideal...', required: true },
    { id: 'avatar', type: 'textarea', title: 'Descreva um cliente ideal real que você atende.', hint: 'Pode ser baseado em alguém real. Quanto mais vivo, melhor a copy.', placeholder: 'Nome, idade, profissão, como ele fala, o que ele quer...', required: true },
    { id: 'dor_principal', type: 'textarea', title: 'Qual a principal dor do público?', hint: 'O que ele falaria pra um amigo sobre o problema.', placeholder: 'A dor com as palavras dele, não suas.', required: true },
    { id: 'desejo_principal', type: 'textarea', title: 'Qual o principal desejo do público?', hint: 'A vida que ele quer levar / o resultado que ele sonha.', placeholder: 'Como ele imagina a vida depois de resolver a dor?', required: true },
    { id: 'objecoes', type: 'textarea', title: 'Principais objeções / dúvidas do público?', hint: 'O que faz ele hesitar antes de comprar / agir.', placeholder: '1) ...\n2) ...', required: true },
    { id: 'diferenciais', type: 'textarea', title: 'Quais são os principais diferenciais da marca / oferta?', placeholder: '3 a 5 pontos.', required: true },
    { id: 'prova_social', type: 'textarea', title: 'Prova social disponível: depoimentos, cases, números.', placeholder: 'Liste o que tem (mesmo que pouco).', required: false },
    { id: 'tom_voz', type: 'multi-other', title: 'Qual o tom de voz da marca?', hint: 'Selecione até 3.', options: ['Próximo / conversacional', 'Formal / corporativo', 'Direto e provocador', 'Sofisticado', 'Inspirador', 'Educativo', 'Divertido / leve', 'Técnico'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'palavras_proibidas', type: 'textarea', title: 'Tem palavras / expressões PROIBIDAS na comunicação?', hint: 'Ex: "barato", "promoção", clichês que você odeia.', placeholder: 'Liste o que evitar...', required: false },
    { id: 'palavras_obrigatorias', type: 'textarea', title: 'Tem palavras / termos OBRIGATÓRIOS?', hint: 'Ex: nome técnico, jargão do setor, termos da marca.', placeholder: 'Liste...', required: false },
    { id: 'referencias_copy', type: 'textarea', title: 'Cite 2-3 referências de copy que você admira.', hint: 'Pode ser marca, copywriter, anúncio, site, e-mail.', placeholder: 'Ex: site da Basecamp, e-mails do Tiago Forte...', required: false },
    { id: 'concorrentes', type: 'textarea', title: 'Quais concorrentes diretos? Como eles se comunicam?', placeholder: 'Marca X — comunicação Y', required: false },
    { id: 'oferta_detalhe', type: 'textarea', title: 'Detalhes da oferta: preço, condições, bônus, garantia.', placeholder: 'Tudo que a copy precisa mencionar...', required: false },
    { id: 'cta_desejado', type: 'text', title: 'Qual a ação que você quer que o leitor tome?', placeholder: 'Ex: clicar, responder, comprar, agendar.', required: true },
    { id: 'prazo', type: 'single', title: 'Qual o prazo desejado?', options: ['Urgente — até 5 dias', '5 a 10 dias', '10 a 20 dias', 'Mais de 20 dias'], required: true },
    { id: 'observacoes', type: 'textarea', title: 'Algo mais que ajude o copywriter?', hint: 'Histórias da marca, links, materiais existentes, restrições.', placeholder: 'Use à vontade...', required: false },
  ],
};
