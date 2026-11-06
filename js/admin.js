(function () {
  const formLogin = document.getElementById('formLogin');
  const formLivro = document.getElementById('formLivro');

  if (formLogin) {
    const erro = document.getElementById('loginErro');
    Alquimia.request('/api/admin/sessao')
      .then(sessao => {
        if (sessao.autenticado) window.location.replace('painel.html');
      })
      .catch(error => {
        erro.textContent = error.message;
        erro.hidden = false;
      });

    formLogin.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = formLogin.querySelector('button[type="submit"]');
      botao.disabled = true;
      erro.hidden = true;
      try {
        await Alquimia.request('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value
          })
        });
        window.location.assign('painel.html');
      } catch (error) {
        erro.textContent = error.message;
        erro.hidden = false;
      } finally {
        botao.disabled = false;
      }
    });
    return;
  }

  if (!formLivro) return;

  const painel = document.getElementById('painel');
  const aviso = document.getElementById('avisoPainel');
  const avisoInicial = document.getElementById('avisoInicial');
  const tbody = document.querySelector('#tabelaLivros tbody');
  const selectAssunto = document.getElementById('assunto');
  const btnSair = document.getElementById('btnSair');
  let livros = [];

  function mostrarAviso(mensagem) {
    aviso.textContent = mensagem;
    aviso.hidden = !mensagem;
  }

  async function carregarSessao() {
    const sessao = await Alquimia.request('/api/admin/sessao');
    if (!sessao.autenticado) {
      window.location.replace('login.html');
      return false;
    }
    painel.hidden = false;
    return true;
  }

  async function carregarAssuntos() {
    const assuntos = await Alquimia.request('/api/assuntos');
    selectAssunto.replaceChildren();
    assuntos.forEach(assunto => {
      const option = document.createElement('option');
      option.value = assunto.id;
      option.textContent = assunto.nome;
      selectAssunto.appendChild(option);
    });
    if (!assuntos.length) {
      mostrarAviso('Cadastre ao menos um assunto na tabela assunto antes de incluir livros.');
    }
  }

  async function carregarLivros() {
    livros = await Alquimia.request('/api/admin/livros');
    tbody.replaceChildren();
    if (!livros.length) {
      const linha = document.createElement('tr');
      const celula = document.createElement('td');
      celula.colSpan = 7;
      celula.textContent = 'Nenhum livro cadastrado.';
      linha.appendChild(celula);
      tbody.appendChild(linha);
      return;
    }
    livros.forEach(livro => {
      const linha = document.createElement('tr');
      const valores = [
        livro.id,
        livro.nome,
        livro.autor,
        livro.assunto,
        Alquimia.formatarPreco(livro.preco),
        livro.em_promocao ? 'Sim' : 'Não',
        livro.destaque_semana ? 'Sim' : 'Não',
        livro.status
      ];
      valores.forEach(valor => {
        const celula = document.createElement('td');
        celula.textContent = valor == null ? '—' : String(valor);
        linha.appendChild(celula);
      });

      const acoes = document.createElement('td');
      acoes.className = 'acoes';
      const editar = document.createElement('button');
      editar.type = 'button';
      editar.className = 'btn-secundario';
      editar.textContent = 'Editar';
      editar.addEventListener('click', () => editarLivro(livro));
      const excluir = document.createElement('button');
      excluir.type = 'button';
      excluir.className = 'btn-secundario';
      excluir.textContent = 'Excluir';
      excluir.addEventListener('click', () => excluirLivro(livro));
      acoes.append(editar, excluir);
      linha.appendChild(acoes);
      tbody.appendChild(linha);
    });
  }

  function novoLivro() {
    formLivro.reset();
    document.getElementById('livroId').value = '';
    document.getElementById('formTitulo').textContent = 'Novo livro';
    document.getElementById('emPromocao').checked = false;
    document.getElementById('destaqueSemana').checked = false;
    document.getElementById('precoPromocao').value = '';
    formLivro.hidden = false;
    document.getElementById('nome').focus();
    mostrarAviso('');
  }

  function editarLivro(livro) {
    document.getElementById('livroId').value = livro.id;
    document.getElementById('nome').value = livro.nome;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('assunto').value = livro.id_assunto;
    document.getElementById('edicao').value = livro.edicao || '';
    document.getElementById('editora').value = livro.editora || '';
    document.getElementById('ano').value = livro.ano || '';
    document.getElementById('preco').value = livro.preco;
    document.getElementById('status').value = livro.status;
    document.getElementById('precoPromocao').value = livro.preco_promocao ?? '';
    document.getElementById('emPromocao').checked = Boolean(livro.em_promocao);
    document.getElementById('destaqueSemana').checked = Boolean(livro.destaque_semana);
    document.getElementById('capa').value = livro.capa || '';
    document.getElementById('formTitulo').textContent = 'Editar livro';
    formLivro.hidden = false;
    document.getElementById('nome').focus();
    mostrarAviso('');
  }

  async function excluirLivro(livro) {
    if (!window.confirm(`Excluir "${livro.nome}"?`)) return;
    try {
      await Alquimia.request('/api/admin/livros/' + livro.id, { method: 'DELETE' });
      mostrarAviso('Livro excluído.');
      await carregarLivros();
    } catch (error) {
      mostrarAviso(error.message);
    }
  }

  document.getElementById('btnNovo').addEventListener('click', novoLivro);
  document.getElementById('btnCancelar').addEventListener('click', () => {
    formLivro.reset();
    formLivro.hidden = true;
    mostrarAviso('');
  });

  formLivro.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById('livroId').value;
    const emPromocao = document.getElementById('emPromocao').checked;
    const destaqueSemana = document.getElementById('destaqueSemana').checked;
    const precoPromocaoValor = document.getElementById('precoPromocao').value;
    const dados = {
      nome: document.getElementById('nome').value,
      autor: document.getElementById('autor').value,
      id_assunto: Number(selectAssunto.value),
      edicao: document.getElementById('edicao').value,
      editora: document.getElementById('editora').value,
      ano: document.getElementById('ano').value || null,
      preco: Number(document.getElementById('preco').value),
      status: document.getElementById('status').value,
      capa: document.getElementById('capa').value,
      em_promocao: emPromocao,
      destaque_semana: destaqueSemana,
      preco_promocao: emPromocao ? (precoPromocaoValor === '' ? null : Number(precoPromocaoValor)) : null
    };

    try {
      await Alquimia.request(id ? '/api/admin/livros/' + id : '/api/admin/livros', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(dados)
      });
      formLivro.reset();
      formLivro.hidden = true;
      mostrarAviso('Livro salvo com sucesso.');
      await carregarLivros();
    } catch (error) {
      mostrarAviso(error.message);
    }
  });

  btnSair.addEventListener('click', async () => {
    btnSair.disabled = true;
    try {
      await Alquimia.request('/api/admin/logout', { method: 'POST', body: '{}' });
      window.location.replace('login.html');
    } catch (error) {
      mostrarAviso(error.message);
      btnSair.disabled = false;
    }
  });

  carregarSessao()
    .then(autenticado => {
      if (!autenticado) return null;
      return Promise.all([carregarAssuntos(), carregarLivros()]);
    })
    .catch(error => {
      if (painel.hidden) {
        avisoInicial.textContent = error.message;
        avisoInicial.hidden = false;
      } else {
        mostrarAviso(error.message);
      }
      console.error('Falha ao carregar o painel administrativo.', error);
    });
})();
