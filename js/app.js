(function () {
  const grid = document.getElementById('livrosGrid');
  const busca = document.getElementById('busca');
  const filtro = document.getElementById('filtroAssunto');
  const sem = document.getElementById('semResultado');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const btnWa = document.getElementById('btnWhatsAppGeral');

  if (btnWa) {
    btnWa.href = linkWhatsApp('Olá! Vim pelo site Alquimia das Páginas e gostaria de saber mais.');
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('aberto'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('aberto')));
  }

  if (!grid) return;

  const livros = carregarLivros();
  const assuntos = [...new Set(livros.map(l => l.assunto))].sort();
  assuntos.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    filtro.appendChild(opt);
  });

  function render(lista) {
    grid.innerHTML = '';
    if (!lista.length) {
      sem.hidden = false;
      return;
    }
    sem.hidden = true;
    lista.forEach(l => {
      const card = document.createElement('a');
      card.className = 'card';
      card.href = 'livro.html?id=' + l.id;
      card.innerHTML =
        '<div class="card-capa">' +
          '<span class="assunto-tag">' + l.assunto + '</span>' +
          l.nome +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + l.nome + '</h3>' +
          '<p class="autor">' + l.autor + '</p>' +
          '<p class="card-meta">' + (l.editora || '—') + ' · ' + (l.ano || '—') + '</p>' +
          '<div class="card-footer">' +
            '<span class="preco">' + formatarPreco(l.preco) + '</span>' +
            '<span class="btn btn-outline btn-sm">Ver</span>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  function filtrar() {
    const termo = (busca.value || '').trim().toLowerCase();
    const ass = filtro.value;
    const lista = livros.filter(l => {
      const okTexto = !termo ||
        l.nome.toLowerCase().includes(termo) ||
        l.autor.toLowerCase().includes(termo) ||
        (l.editora && l.editora.toLowerCase().includes(termo));
      const okAss = !ass || l.assunto === ass;
      return okTexto && okAss && l.status === 'disponivel';
    });
    render(lista);
  }

  busca.addEventListener('input', filtrar);
  filtro.addEventListener('change', filtrar);
  filtrar();
})();
