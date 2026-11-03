(function () {
  const WHATSAPP = '';
  const MENSAGEM_WHATSAPP = 'Olá! Vim pelo site Alquimia das Páginas e gostaria de saber mais sobre o acervo.';

  async function request(url, options) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.erro || 'Não foi possível concluir a solicitação.');
    }
    return data;
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function linkWhatsApp(texto) {
    const destinatario = WHATSAPP ? WHATSAPP + '/' : '';
    return 'https://wa.me/' + destinatario + '?text=' + encodeURIComponent(texto);
  }

  document.querySelectorAll('[data-whatsapp="geral"]').forEach(link => {
    link.href = linkWhatsApp(MENSAGEM_WHATSAPP);
  });

  function criarCapa(capa, titulo, classe) {
    const container = document.createElement('div');
    container.className = classe;
    if (capa) {
      try {
        const url = new URL(capa, window.location.origin);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          const imagem = document.createElement('img');
          imagem.src = url.href;
          imagem.alt = 'Capa de ' + titulo;
          imagem.onerror = () => {
            container.replaceChildren(criarPlaceholder(titulo));
          };
          container.appendChild(imagem);
          return container;
        }
      } catch (error) {
        console.warn('O caminho da capa do livro é inválido.', error);
      }
    }
    container.appendChild(criarPlaceholder(titulo));
    return container;
  }

  function criarPlaceholder(titulo) {
    const placeholder = document.createElement('div');
    placeholder.className = 'sem-capa';
    placeholder.textContent = titulo || 'Sem capa disponível';
    return placeholder;
  }

  window.Alquimia = { request, formatarPreco, linkWhatsApp, criarCapa };
})();
