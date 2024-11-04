function mostrarConteudo(index) {
  // Remove a classe 'active' de todos os itens do menu e conteúdos
  var menuItens = document.querySelectorAll('.menu-item');
  var conteudos = document.querySelectorAll('.conteudolinhasdepesquisa');
  var tabela = document.getElementById('tabela')
  menuItens.forEach(function(item) {
    item.classList.remove('active');
    
  });

  conteudos.forEach(function(conteudo) {
    conteudo.classList.remove('active');
  });

  // Adiciona a classe 'active' ao item e conteúdo correspondente
  menuItens[index].classList.add('active');

  conteudos[index].classList.add('active');
  tabela.style.backgroundColor = conteudos[index].style.backgroundColor;
}