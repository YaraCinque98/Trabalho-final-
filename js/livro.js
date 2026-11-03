(function () {
  const box = document.getElementById('detalheLivro');
  if (!box) return;

  async function carregarDetalhe() {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    if (!Number.isInteger(id) || id < 1) {
      mostrarErro('Livro não encontrado.');
      return;
    }

    try {
      const livro = await Alquimia.request('/api/livros/' + id);
      document.title = livro.nome + ' – Alquimia das Páginas';
      box.replaceChildren();
      box.classList.add('detalhe-grid');
      box.appendChild(Alquimia.criarCapa(livro.capa, livro.nome, 'capa-grande'));

      const info = document.createElement('div');
      info.className = 'info-livro';
      const titulo = document.createElement('h1');
      titulo.textContent = livro.nome;
      const autor = document.createElement('p');
      autor.className = 'autor';
      autor.textContent = 'por ' + livro.autor;
      const assunto = document.createElement('p');
      assunto.textContent = 'Assunto: ' + livro.assunto;
      const edicao = document.createElement('p');
      edicao.textContent = 'Edição: ' + (livro.edicao || '—');
      const editora = document.createElement('p');
      editora.textContent = 'Editora: ' + (livro.editora || '—');
      const ano = document.createElement('p');
      ano.textContent = 'Ano: ' + (livro.ano || '—');
      const status = document.createElement('p');
      status.textContent = 'Status: ' + (livro.status === 'disponivel' ? 'Disponível' : livro.status);
      const preco = document.createElement('p');
      preco.className = 'preco';
      preco.textContent = Alquimia.formatarPreco(livro.preco);

      info.append(titulo, autor, assunto, edicao, editora, ano, status, preco);
      if (livro.status === 'disponivel') {
        const whatsapp = document.createElement('a');
        whatsapp.className = 'btn-whatsapp';
        whatsapp.href = Alquimia.linkWhatsApp(
          `Olá! Tenho interesse no livro "${livro.nome}" (${livro.autor}) – ${Alquimia.formatarPreco(livro.preco)}. Ainda está disponível?`
        );
        whatsapp.target = '_blank';
        whatsapp.rel = 'noopener';
        whatsapp.textContent = 'Quero este livro (WhatsApp)';
        info.appendChild(whatsapp);
      }

      const voltar = document.createElement('a');
      voltar.className = 'voltar';
      voltar.href = 'catalogo.html';
      voltar.textContent = '← Voltar ao catálogo';
      info.appendChild(voltar);
      box.appendChild(info);
    } catch (error) {
      mostrarErro(error.message);
      console.error('Falha ao carregar o livro.', error);
    }
  }

  function mostrarErro(mensagem) {
    box.classList.remove('detalhe-grid');
    const aviso = document.createElement('p');
    aviso.className = 'vazio';
    aviso.textContent = mensagem + ' ';
    const voltar = document.createElement('a');
    voltar.href = 'catalogo.html';
    voltar.textContent = 'Voltar ao catálogo';
    aviso.appendChild(voltar);
    box.replaceChildren(aviso);
  }

  carregarDetalhe();
})();
