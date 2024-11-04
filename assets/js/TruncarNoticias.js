document.addEventListener("DOMContentLoaded", function() {
    // Selecionar todos os elementos de descrição com a classe 'cardnoticia-descricao'
    const postDescriptionElements = document.querySelectorAll('.cardnoticia-descricao');

    // Iterar sobre todas as descrições e truncar se necessário
    postDescriptionElements.forEach(function(postDescriptionElement) {
      // Pegar o texto atual do parágrafo
      let postExcerpt = postDescriptionElement.textContent;

      // Truncar o excerpt em 240 caracteres
      let truncatedExcerpt = postExcerpt.length > 240 ? postExcerpt.slice(0, 240) + '...' : postExcerpt;

      // Atualizar o texto da descrição no DOM
      postDescriptionElement.textContent = truncatedExcerpt;
    });
  });