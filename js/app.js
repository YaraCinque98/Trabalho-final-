(function () {
  const grids = [...document.querySelectorAll('#livrosGrid, #livrosDestaque, #livrosPromocao')];
  if (!grids.length) return;

  const busca = document.getElementById('busca');
  const filtro = document.getElementById('filtroAssunto');
  const aviso = document.getElementById('avisoLivros');
  const assuntoInicial = new URLSearchParams(window.location.search).get('assunto');
  let temporizador;
  let requisicaoAtual = 0;

  function mostrarEstadoVazio(container, tipo) {
    const mensagem = tipo === 'destaque'
      ? 'Ainda não há achados da semana por aqui.'
      : 'Ainda não há livros em promoção no momento.';

    const estado = document.createElement('div');
    estado.className = 'vazio-grid';
    estado.textContent = mensagem;
    container.replaceChildren(estado);
  }

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
    const temPromocao = Boolean(livro.em_promocao) && livro.preco_promocao != null && Number(livro.preco_promocao) >= 0;
    if (temPromocao) {
      const precoAntes = document.createElement('span');
      precoAntes.className = 'preco-antigo';
      precoAntes.textContent = Alquimia.formatarPreco(livro.preco);
      const precoAtual = document.createElement('span');
      precoAtual.className = 'preco-atual';
      precoAtual.textContent = Alquimia.formatarPreco(livro.preco_promocao);
      preco.append(precoAntes, precoAtual);
    } else {
      preco.textContent = Alquimia.formatarPreco(livro.preco);
    }
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
      const destaqueGrid = document.getElementById('livrosDestaque');
      const promocaoGrid = document.getElementById('livrosPromocao');

      if (destaqueGrid || promocaoGrid) {
        const [livrosDestaque, livrosPromocao] = await Promise.all([
          destaqueGrid ? Alquimia.request('/api/livros?destaque=1&limite=4') : Promise.resolve([]),
          promocaoGrid ? Alquimia.request('/api/livros?promocao=1&limite=4') : Promise.resolve([])
        ]);
        if (numeroRequisicao !== requisicaoAtual) return;
        if (destaqueGrid) {
          if (livrosDestaque.length) {
            destaqueGrid.replaceChildren(...livrosDestaque.map(criarCard));
          } else {
            mostrarEstadoVazio(destaqueGrid, 'destaque');
          }
        }
        if (promocaoGrid) {
          if (livrosPromocao.length) {
            promocaoGrid.replaceChildren(...livrosPromocao.map(criarCard));
          } else {
            mostrarEstadoVazio(promocaoGrid, 'promocao');
          }
        }
        return;
      }

      const parametros = new URLSearchParams();
      if (busca && busca.value.trim()) parametros.set('busca', busca.value.trim());
      if (filtro && filtro.value) parametros.set('assunto', filtro.value);
      const queryString = parametros.toString();
      const query = queryString ? '?' + queryString : '';
      const livros = await Alquimia.request('/api/livros' + query);
      if (numeroRequisicao !== requisicaoAtual) return;

      const gridCatalogo = document.getElementById('livrosGrid');
      if (gridCatalogo) {
        gridCatalogo.replaceChildren(...livros.map(criarCard));
      }
      if (aviso) {
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
    carregarAssuntos()
      .then(() => {
        if (assuntoInicial) {
          filtro.value = assuntoInicial;
        }
        carregarLivros();
      })
      .catch(error => {
        if (aviso) {
          aviso.hidden = false;
          aviso.textContent = error.message;
        }
        console.error('Falha ao carregar os assuntos.', error);
      });
  } else {
    carregarLivros();
  }

  if (busca) {
    busca.addEventListener('input', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(carregarLivros, 250);
    });
  }
  if (filtro) filtro.addEventListener('change', carregarLivros);
})();
