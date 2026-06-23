import type { TemplateDef } from './types';

export const identidadeVisualTemplate: TemplateDef = {
  categorySlug: 'identidade-visual',
  categoryName: 'Identidade Visual',
  intro: {
    eyebrow: 'Briefing · Think Brand',
    title: 'Vamos construir a identidade visual <em>do seu negócio.</em>',
    description:
      'Esse formulário é o ponto de partida do seu projeto de marca e brandbook na Think Brand. São 22 perguntas rápidas sobre o produto, o público e a estética que você quer transmitir. Suas respostas viram a base para toda a construção visual.',
    meta: [
      { value: '±10 min', label: 'tempo médio' },
      { value: '22 perguntas', label: 'uma por vez' },
      { value: 'Sem cadastro', label: '' },
    ],
    buttonLabel: 'Começar',
  },
  questions: [
    { id: 'cliente_nome', type: 'text', title: 'Qual é o seu nome?', hint: 'Vamos usar pra te chamar pelo nome durante o processo.', placeholder: 'Digite seu nome completo', required: true },
    { id: 'produto_nome', type: 'text', title: 'Qual é o nome do produto ou empresa?', placeholder: 'Ex: Café Aurora', required: true },
    { id: 'nome_significado', type: 'textarea', title: 'Por que o produto tem esse nome?', hint: 'Conta o que ele significa pro negócio e a história por trás.', placeholder: 'Escreva aqui...', required: true },
    { id: 'descricao_produto', type: 'textarea', title: 'Descreva o produto.', hint: 'Funcionalidades, entregáveis, o que ele faz na prática.', placeholder: 'O que o produto faz, o que entrega...', required: true },
    { id: 'diferencial', type: 'textarea', title: 'O que diferencia o produto dos demais no mercado?', placeholder: 'Por que escolher esse e não o concorrente?', required: true },
    { id: 'slogan', type: 'text', title: 'O produto possui slogan?', hint: 'Se sim, qual é. Se ainda não tem, deixe em branco.', placeholder: 'Ex: "Pense diferente."', required: false },
    { id: 'concorrentes', type: 'textarea', title: 'O produto possui concorrentes?', hint: 'Se sim, cite quais. Se ainda não identificou, deixe em branco.', placeholder: 'Cite os principais concorrentes...', required: false },
    { id: 'concorrentes_oferecem', type: 'textarea', title: 'O que os concorrentes oferecem que vocês ainda não oferecem?', placeholder: 'Pode listar serviços, features, benefícios...', required: false },
    { id: 'publico_alvo', type: 'textarea', title: 'Quem é o público-alvo do produto?', hint: 'Descreva de forma geral antes das opções específicas.', placeholder: 'Para quem o produto é feito?', required: true },
    { id: 'classe_social', type: 'single', title: 'Qual a classe social do público?', options: ['Classe C', 'Classe média', 'Rico', 'Muito rico'], required: true },
    { id: 'faixa_etaria', type: 'single', title: 'Qual a faixa etária do público?', options: ['Jovens até 25 anos', 'Adultos até 35 anos', 'Quarentão pra cima', 'Todas as faixas'], required: true },
    { id: 'genero', type: 'single', title: 'Qual o gênero do público?', options: ['Masculino', 'Feminino', 'Ambos'], required: true },
    { id: 'clientes_quem', type: 'textarea', title: 'Descreva quem são seus clientes.', hint: 'Personalidade, hábitos, dores, sonhos — o que vier à mente.', placeholder: 'Conta com suas palavras...', required: true },
    { id: 'como_descrito', type: 'textarea', title: 'Como você gostaria que seu produto fosse descrito pelos clientes finais?', hint: 'Imagine um cliente recomendando seu produto: o que ele diria?', placeholder: '"Esse produto é..."', required: true },
    { id: 'caracteristicas', type: 'multi-other', title: 'Quais características o produto deve transmitir?', hint: 'Selecione todas que se aplicam.', options: ['Moderno', 'Exclusivo', 'Determinado', 'Profissional', 'Refinado', 'Acessível', 'Confiável', 'Inovador'], required: true, config: { allowOther: true, min: 1 } },
    { id: 'caracteristicas_top3', type: 'multi-from-prev', title: 'Das características escolhidas, quais são as 3 mais importantes?', hint: 'Escolha até 3 — em ordem de importância não importa.', required: true, config: { sourceId: 'caracteristicas', max: 3, min: 1 } },
    { id: 'caracteristicas_nao', type: 'textarea', title: 'Quais características o produto NÃO deve transmitir?', placeholder: 'Ex: "infantil", "frio", "antiquado"...', required: false },
    { id: 'cor_obrigatoria', type: 'textarea', title: 'Existe alguma cor que DEVE estar presente na marca?', hint: 'Pode citar HEX, nome ou referência (ex: "o azul da Nubank").', placeholder: 'Ex: azul royal, #0066FF...', required: false },
    { id: 'cor_proibida', type: 'textarea', title: 'Existe alguma cor que NÃO deve estar presente na marca?', placeholder: 'Cores que você não quer ver na identidade...', required: false },
    { id: 'elemento_desejado', type: 'textarea', title: 'Existe algum elemento gráfico desejado na marca?', hint: 'Pode ser um símbolo, ícone, forma ou referência visual.', placeholder: 'Ex: um leão, uma estrela, formas geométricas...', required: false },
    { id: 'elemento_proibido', type: 'textarea', title: 'Existe algum elemento gráfico que NÃO deve estar presente?', placeholder: 'O que evitar...', required: false },
    { id: 'marcas_admiradas', type: 'brands', title: 'Cite até 3 marcas cuja identidade visual você admira.', hint: 'Pode ser do mesmo segmento ou completamente diferente.', required: false, config: { brandsMax: 3 } },
  ],
};
