(function () {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('aberto'));
  }

  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id'));
  const box = document.getElementById('detalheLivro');
  const livros = carregarLivros();
  const livro = livros.find(l => Number(l.id) === id);

  if (!livro) {
    box.innerHTML = '<p class="vazio">Livro não encontrado. <a href="index.html">Voltar ao catálogo</a></p>';
    return;
  }

  document.title = livro.nome + ' – Alquimia das Páginas';

  const wa = linkWhatsApp(
    'Olá! Tenho interesse no livro "' + livro.nome + '" (' + livro.autor + ') – ' +
    formatarPreco(livro.preco) + '. Ainda está disponível?'
  );

  const sinopse = livro.descricao
    ? livro.descricao
    : 'Sinopse não cadastrada para este livro.';

  box.innerHTML =
    '<div class="detalhe-capa">' + livro.nome + '</div>' +
    '<div>' +
      '<h1>' + livro.nome + '</h1>' +
      '<p class="autor">' + livro.autor + '</p>' +
      '<dl class="detalhe-meta">' +
        '<div><dt>Assunto</dt><dd>' + livro.assunto + '</dd></div>' +
        '<div><dt>Edição</dt><dd>' + (livro.edicao || '—') + '</dd></div>' +
        '<div><dt>Editora</dt><dd>' + (livro.editora || '—') + '</dd></div>' +
        '<div><dt>Ano</dt><dd>' + (livro.ano || '—') + '</dd></div>' +
        '<div><dt>Status</dt><dd>' + (livro.status === 'disponivel' ? 'Disponível' : livro.status) + '</dd></div>' +
      '</dl>' +
      '<p class="preco-grande">' + formatarPreco(livro.preco) + '</p>' +
      '<div class="sinopse">' +
        '<h2>Sinopse</h2>' +
        '<p>' + sinopse + '</p>' +
      '</div>' +
      '<div style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:.75rem">' +
        '<a class="btn btn-whatsapp" href="' + wa + '" target="_blank" rel="noopener">Quero este livro (WhatsApp)</a>' +
        '<a href="index.html" class="btn btn-outline">← Voltar ao catálogo</a>' +
      '</div>' +
    '</div>';
})();
