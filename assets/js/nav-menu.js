jQuery(document).ready(function($) {
  // Navegação móvel (hamburger menu)
  $('.mobile-menu').on('click', function() {
      $(this).toggleClass('active'); // Alterna o estado do ícone de menu móvel
      $('.nav-header, .gtranslate_wrapper').toggleClass('open'); // Exibe ou esconde o menu e o seletor de idioma
  });

  // Fecha o menu móvel se clicar fora dele
  $(document).click(function(e) {
      var container = $(".mobile-menu, .nav-header, .gtranslate_wrapper");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
          if ($('.nav-header').hasClass('open')) {
              $('.mobile-menu').removeClass('active');
              $('.nav-header, .gtranslate_wrapper').removeClass('open');
          }
      }
  });
});
