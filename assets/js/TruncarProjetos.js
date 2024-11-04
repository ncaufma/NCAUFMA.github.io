document.addEventListener("DOMContentLoaded", function() {
    // Selecionar todos os elementos de descrição dos projetos com a classe 'cardProjeto-descricao'
    const projetoDescriptionElements = document.querySelectorAll('.cardProjeto-descricao');

    // Iterar sobre todas as descrições e truncar se necessário
    projetoDescriptionElements.forEach(function(projetoDescriptionElement) {
      // Pegar o texto atual do parágrafo
      let projetoExcerpt = projetoDescriptionElement.textContent;

      // Truncar a descrição em 240 caracteres
      let truncatedExcerpt = projetoExcerpt.length > 300 ? projetoExcerpt.slice(0, 300) + '...' : projetoExcerpt;

      // Atualizar o texto da descrição no DOM
      projetoDescriptionElement.textContent = truncatedExcerpt;
    });
  });