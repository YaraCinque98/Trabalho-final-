(function () {
  const ADMIN_EMAIL = 'admin@alquimia.local';
  const ADMIN_SENHA = 'admin123';

  const telaLogin = document.getElementById('telaLogin');
  const telaPainel = document.getElementById('telaPainel');
  const formLogin = document.getElementById('formLogin');
  const loginErro = document.getElementById('loginErro');
  const btnSair = document.getElementById('btnSair');
  const abaLista = document.getElementById('abaLista');
  const abaForm = document.getElementById('abaForm');
  const formLivro = document.getElementById('formLivro');
  const tbody = document.querySelector('#tabelaLivros tbody');
  const selectAssunto = document.getElementById('assunto');

  function logado() {
    return sessionStorage.getItem('alquimia_admin') === '1';
  }

  function mostrarPainel() {
    telaLogin.hidden = true;
    telaPainel.hidden = false;
    preencherAssuntos();
    renderTabela();
  }

  function mostrarLogin() {
    telaLogin.hidden = false;
    telaPainel.hidden = true;
    sessionStorage.removeItem('alquimia_admin');
  }

  if (logado()) mostrarPainel();

  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
      sessionStorage.setItem('alquimia_admin', '1');
      loginErro.hidden = true;
      mostrarPainel();
    } else {
      loginErro.textContent = 'E-mail ou senha incorretos.';
      loginErro.hidden = false;
    }
  });

  btnSair.addEventListener('click', mostrarLogin);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      const aba = btn.getAttribute('data-aba');
      abaLista.hidden = aba !== 'lista';
      abaForm.hidden = aba !== 'form';
      if (aba === 'form' && !document.getElementById('livroId').value) {
        formLivro.reset();
        document.getElementById('livroId').value = '';
        document.getElementById('formTitulo').textContent = 'Novo livro';
      }
    });
  });

  document.getElementById('btnNovo').addEventListener('click', function () {
    formLivro.reset();
    document.getElementById('livroId').value = '';
    document.getElementById('formTitulo').textContent = 'Novo livro';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
    document.querySelector('[data-aba="form"]').classList.add('ativo');
    abaLista.hidden = true;
    abaForm.hidden = false;
  });

  document.getElementById('btnCancelar').addEventListener('click', function () {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
    document.querySelector('[data-aba="lista"]').classList.add('ativo');
    abaForm.hidden = true;
    abaLista.hidden = false;
  });

  function preencherAssuntos() {
    selectAssunto.innerHTML = '';
    ASSUNTOS_PADRAO.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      selectAssunto.appendChild(opt);
    });
  }

  function renderTabela() {
    const livros = carregarLivros();
    tbody.innerHTML = '';
    livros.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + l.nome + '</td>' +
        '<td>' + l.autor + '</td>' +
        '<td>' + l.assunto + '</td>' +
        '<td>' + formatarPreco(l.preco) + '</td>' +
        '<td class="acoes">' +
          '<button type="button" class="btn btn-outline btn-sm" data-editar="' + l.id + '">Editar</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-excluir="' + l.id + '">Excluir</button>' +
        '</td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-editar]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = Number(btn.getAttribute('data-editar'));
        const l = carregarLivros().find(x => Number(x.id) === id);
        if (!l) return;
        document.getElementById('livroId').value = l.id;
        document.getElementById('nome').value = l.nome;
        document.getElementById('autor').value = l.autor;
        document.getElementById('assunto').value = l.assunto;
        document.getElementById('edicao').value = l.edicao || '';
        document.getElementById('editora').value = l.editora || '';
        document.getElementById('ano').value = l.ano || '';
        document.getElementById('preco').value = String(l.preco).replace('.', ',');
        document.getElementById('status').value = l.status || 'disponivel';
        document.getElementById('descricao').value = l.descricao || '';
        document.getElementById('formTitulo').textContent = 'Editar livro';
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
        document.querySelector('[data-aba="form"]').classList.add('ativo');
        abaLista.hidden = true;
        abaForm.hidden = false;
      });
    });

    tbody.querySelectorAll('[data-excluir]').forEach(btn => {
      btn.addEventListener('click', function () {
        if (!confirm('Excluir este livro?')) return;
        const id = Number(btn.getAttribute('data-excluir'));
        const lista = carregarLivros().filter(x => Number(x.id) !== id);
        salvarLivros(lista);
        renderTabela();
      });
    });
  }

  formLivro.addEventListener('submit', function (e) {
    e.preventDefault();
    const lista = carregarLivros();
    const idAtual = document.getElementById('livroId').value;
    const precoStr = document.getElementById('preco').value.replace(',', '.');
    const dados = {
      id: idAtual ? Number(idAtual) : (lista.reduce((m, l) => Math.max(m, Number(l.id)), 0) + 1),
      nome: document.getElementById('nome').value.trim(),
      autor: document.getElementById('autor').value.trim(),
      assunto: document.getElementById('assunto').value,
      edicao: document.getElementById('edicao').value.trim(),
      editora: document.getElementById('editora').value.trim(),
      ano: Number(document.getElementById('ano').value) || null,
      preco: parseFloat(precoStr) || 0,
      status: document.getElementById('status').value,
      descricao: document.getElementById('descricao').value.trim()
    };

    if (idAtual) {
      const i = lista.findIndex(x => Number(x.id) === Number(idAtual));
      if (i >= 0) lista[i] = dados;
    } else {
      lista.push(dados);
    }
    salvarLivros(lista);
    renderTabela();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
    document.querySelector('[data-aba="lista"]').classList.add('ativo');
    abaForm.hidden = true;
    abaLista.hidden = false;
  });
})();
