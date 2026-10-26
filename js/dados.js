/* Dados do sebo – HTML5 (localStorage). Espelha as tabelas do MySQL. */
const WHATSAPP = '5511999999999'; // país + DDD + número

const ASSUNTOS_PADRAO = [
  'Romance', 'Técnico', 'Infantil', 'Filosofia', 'História', 'Poesia'
];

const LIVROS_PADRAO = [
  {
    id: 1,
    nome: 'Dom Casmurro',
    autor: 'Machado de Assis',
    edicao: '2ª edição',
    editora: 'Garnier',
    ano: 1899,
    assunto: 'Romance',
    preco: 28,
    status: 'disponivel',
    descricao: 'Bentinho narra sua história de ciúmes e dúvida em relação a Capitu, em um dos maiores clássicos da literatura brasileira.'
  },
  {
    id: 2,
    nome: 'O Pequeno Príncipe',
    autor: 'Antoine de Saint-Exupéry',
    edicao: 'Edição especial',
    editora: 'Agir',
    ano: 2015,
    assunto: 'Infantil',
    preco: 22.5,
    status: 'disponivel',
    descricao: 'Um piloto encontra um pequeno príncipe vindo de outro planeta e aprende lições sobre amizade, amor e o essencial da vida.'
  },
  {
    id: 3,
    nome: 'Python para Iniciantes',
    autor: 'José Augusto',
    edicao: '1ª edição',
    editora: 'Novatec',
    ano: 2020,
    assunto: 'Técnico',
    preco: 45,
    status: 'disponivel',
    descricao: 'Introdução prática à linguagem Python, com exemplos claros para quem está começando na programação.'
  },
  {
    id: 4,
    nome: 'A República',
    autor: 'Platão',
    edicao: '3ª edição',
    editora: 'Martins Fontes',
    ano: 2012,
    assunto: 'Filosofia',
    preco: 35,
    status: 'disponivel',
    descricao: 'Diálogo de Platão sobre justiça, política e a organização ideal da cidade, base do pensamento ocidental.'
  },
  {
    id: 5,
    nome: 'Senhora',
    autor: 'José de Alencar',
    edicao: '1ª edição',
    editora: 'Ática',
    ano: 2008,
    assunto: 'Romance',
    preco: 18,
    status: 'disponivel',
    descricao: 'Romance urbano de José de Alencar sobre Aurélia e o casamento por interesse na sociedade do século XIX.'
  },
  {
    id: 6,
    nome: 'História do Brasil',
    autor: 'Boris Fausto',
    edicao: '14ª edição',
    editora: 'Edusp',
    ano: 2019,
    assunto: 'História',
    preco: 52,
    status: 'disponivel',
    descricao: 'Panorama da história do Brasil desde a colonização até os tempos recentes, em linguagem acessível.'
  },
  {
    id: 7,
    nome: 'Antologia Poética',
    autor: 'Carlos Drummond de Andrade',
    edicao: '5ª edição',
    editora: 'Record',
    ano: 2016,
    assunto: 'Poesia',
    preco: 30,
    status: 'disponivel',
    descricao: 'Seleção de poemas de Drummond, com os versos mais marcantes do autor mineiro.'
  },
  {
    id: 8,
    nome: 'Redes de Computadores',
    autor: 'Andrew Tanenbaum',
    edicao: '5ª edição',
    editora: 'Pearson',
    ano: 2011,
    assunto: 'Técnico',
    preco: 68,
    status: 'disponivel',
    descricao: 'Obra de referência sobre redes de computadores, protocolos e arquitetura de sistemas distribuídos.'
  }
];

function carregarLivros() {
  const salvos = localStorage.getItem('alquimia_livros');
  if (salvos) {
    try { return JSON.parse(salvos); } catch (e) { /* ignore */ }
  }
  localStorage.setItem('alquimia_livros', JSON.stringify(LIVROS_PADRAO));
  return [...LIVROS_PADRAO];
}

function salvarLivros(lista) {
  localStorage.setItem('alquimia_livros', JSON.stringify(lista));
}

function formatarPreco(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function linkWhatsApp(texto) {
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
}
