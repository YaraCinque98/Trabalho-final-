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

  const CAPAS_PADRAO = [
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80'
  ];

  function gerarCapaPadrao(titulo) {
    const texto = (titulo || 'livro').toString();
    let soma = 0;
    for (let i = 0; i < texto.length; i += 1) {
      soma += texto.charCodeAt(i) * (i + 1);
    }
    return CAPAS_PADRAO[soma % CAPAS_PADRAO.length];
  }

  function criarCapa(capa, titulo, classe) {
    const container = document.createElement('div');
    container.className = classe;

    const urlImagem = capa || gerarCapaPadrao(titulo);
    const imagem = document.createElement('img');
    imagem.alt = 'Capa de ' + (titulo || 'livro');
    imagem.loading = 'lazy';
    imagem.onerror = () => {
      imagem.src = gerarCapaPadrao(titulo);
      imagem.onerror = () => {
        container.replaceChildren(criarPlaceholder(titulo));
      };
    };

    try {
      const url = new URL(urlImagem, window.location.origin);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        imagem.src = url.href;
        container.appendChild(imagem);
        return container;
      }
    } catch (error) {
      console.warn('O caminho da capa do livro é inválido.', error);
    }

    const fallback = gerarCapaPadrao(titulo);
    imagem.src = fallback;
    container.appendChild(imagem);
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
