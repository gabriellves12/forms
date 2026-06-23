/**
 * Google Apps Script — Briefing Think Brand
 * --------------------------------------------------------
 * Como usar:
 *   1. Crie uma nova planilha no Google Sheets.
 *   2. Vá em Extensões → Apps Script.
 *   3. Apague o conteúdo de Code.gs e cole TUDO daqui dentro.
 *   4. Salve (💾) e dê um nome ao projeto (ex: "Briefing Think Brand").
 *   5. Clique em Implantar → Nova implantação.
 *      Tipo: "App da Web".
 *      Executar como: "Eu".
 *      Quem tem acesso: "Qualquer pessoa".
 *      Clique em Implantar, autorize sua conta.
 *   6. Copie a URL que aparece (termina em /exec).
 *   7. Abra briefing.html e cole essa URL na constante
 *      `APPS_SCRIPT_URL` no início do <script>.
 *
 * Pronto. As respostas vão aparecer na planilha automaticamente,
 * com data/hora na primeira coluna.
 *
 * ⚠️ Sempre que editar este script, faça "Implantar → Gerenciar implantações
 *    → ✏️ Editar → Versão: Nova versão → Implantar" para que as mudanças
 *    valham na URL existente. Senão a URL antiga continua usando a versão antiga.
 */

// =====================================================
// CONFIG — ordem das colunas (precisa bater com QUESTIONS do front)
// =====================================================
const COLUMNS = [
  { key: 'timestamp',              header: 'Data/Hora' },
  { key: 'cliente_nome',           header: '1. Nome do cliente' },
  { key: 'produto_nome',           header: '2. Nome do produto/empresa' },
  { key: 'nome_significado',       header: '3. Significado do nome' },
  { key: 'descricao_produto',      header: '4. Descrição do produto' },
  { key: 'diferencial',            header: '5. Diferencial no mercado' },
  { key: 'slogan',                 header: '6. Slogan' },
  { key: 'concorrentes',           header: '7. Concorrentes' },
  { key: 'concorrentes_oferecem',  header: '8. O que concorrentes oferecem' },
  { key: 'publico_alvo',           header: '9. Público-alvo' },
  { key: 'classe_social',          header: '10. Classe social' },
  { key: 'faixa_etaria',           header: '11. Faixa etária' },
  { key: 'genero',                 header: '12. Gênero' },
  { key: 'clientes_quem',          header: '13. Quem são os clientes' },
  { key: 'como_descrito',          header: '14. Como gostaria de ser descrito' },
  { key: 'caracteristicas',        header: '15. Características que deve transmitir' },
  { key: 'caracteristicas_top3',   header: '16. Top 3 características' },
  { key: 'caracteristicas_nao',    header: '17. Características que NÃO transmitir' },
  { key: 'cor_obrigatoria',        header: '18. Cor obrigatória' },
  { key: 'cor_proibida',           header: '19. Cor proibida' },
  { key: 'elemento_desejado',      header: '20. Elemento gráfico desejado' },
  { key: 'elemento_proibido',      header: '21. Elemento gráfico proibido' },
  { key: 'marcas_admiradas',       header: '22. Marcas admiradas' },
];

// =====================================================
// HANDLER PRINCIPAL — recebe POST do front
// =====================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Garante headers na primeira linha
    ensureHeaders_(sheet);

    // Monta a linha na ordem das colunas
    const row = COLUMNS.map(col => {
      if (col.key === 'timestamp') {
        // sempre usa o timestamp do servidor (mais confiável que do client)
        return new Date();
      }
      return data[col.key] !== undefined ? data[col.key] : '';
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================
// HANDLER GET — opcional, só pra testar se está no ar
// =====================================================
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'online', columns: COLUMNS.length }))
    .setMimeType(ContentService.MimeType.JSON);
}

// =====================================================
// HELPERS
// =====================================================
function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return; // já tem header
  const headers = COLUMNS.map(c => c.header);
  sheet.appendRow(headers);

  // Formatação do cabeçalho
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#181818');
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  // Larguras razoáveis
  sheet.setColumnWidth(1, 160);        // Data/Hora
  for (let i = 2; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 220);
  }
}
