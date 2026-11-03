(function () {
  const grid = document.getElementById('livrosGrid') || document.getElementById('livrosDestaque');
  if (!grid) return;

  const busca = document.getElementById('busca');
  const filtro = document.getElementById('filtroAssunto');
  const aviso = document.getElementById('avisoLivros');
  const destaques = grid.id === 'livrosDestaque';
  let temporizador;
  let requisicaoAtual = 0;

  function criarCard(livro) {
    const card = document.createElement('article');
    card.className = 'card-livro';
    const link = document.createElement('a');
    link.className = 'card-livro-link';
    link.href = 'livro.html?id=' + encodeURIComponent(livro.id);
    link.appendChild(Alquimia.criarCapa(livro.capa, livro.nome, 'capa'));

    const info = document.createElement('div');
    info.className = 'info';
    const titulo = document.createElement('h3');
    titulo.textContent = livro.nome;
    const autor = document.createElement('p');
    autor.className = 'autor';
    autor.textContent = livro.autor;
    const preco = document.createElement('p');
    preco.className = 'preco';
    preco.textContent = Alquimia.formatarPreco(livro.preco);
    const assunto = document.createElement('p');
    assunto.textContent = livro.assunto;
    const ver = document.createElement('span');
    ver.className = 'btn-secundario';
    ver.textContent = 'Ver detalhes';

    info.append(titulo, autor, assunto, preco, ver);
    link.appendChild(info);
    card.appendChild(link);
    return card;
  }

  async function carregarAssuntos() {
    if (!filtro) return;
    const assuntos = await Alquimia.request('/api/assuntos');
    assuntos.forEach(assunto => {
      const option = document.createElement('option');
      option.value = assunto.id;
      option.textContent = assunto.nome;
      filtro.appendChild(option);
    });
  }

  async function carregarLivros() {
    const numeroRequisicao = ++requisicaoAtual;
    if (aviso) {
      aviso.hidden = true;
      aviso.textContent = '';
    }

    try {
      const parametros = new URLSearchParams();
      if (destaques) {
        parametros.set('limite', '4');
      } else {
        if (busca && busca.value.trim()) parametros.set('busca', busca.value.trim());
        if (filtro && filtro.value) parametros.set('assunto', filtro.value);
      }
      const queryString = parametros.toString();
      const query = queryString ? '?' + queryString : '';
      const livros = await Alquimia.request('/api/livros' + query);
      if (numeroRequisicao !== requisicaoAtual) return;
      grid.replaceChildren(...livros.map(criarCard));
      if (!destaques && aviso) {
        aviso.hidden = livros.length > 0;
        aviso.textContent = livros.length ? '' : 'Nenhum livro disponível encontrado.';
      }
    } catch (error) {
      if (numeroRequisicao !== requisicaoAtual) return;
      if (aviso) {
        aviso.hidden = false;
        aviso.textContent = error.message;
      }
      console.error('Falha ao carregar o catálogo.', error);
    }
  }

  if (filtro) {
    carregarAssuntos().catch(error => {
      if (aviso) {
        aviso.hidden = false;
        aviso.textContent = error.message;
      }
      console.error('Falha ao carregar os assuntos.', error);
    });
  }
  if (busca) {
    busca.addEventListener('input', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(carregarLivros, 250);
    });
  }
  if (filtro) filtro.addEventListener('change', carregarLivros);
  carregarLivros();
})();
