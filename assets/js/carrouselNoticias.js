document.addEventListener('DOMContentLoaded', function () {
  var swiperhome = new Swiper('.carouselNoticias', {
    loop: true,
    autoplay: {
      delay: 8000,
      disableOnInteraction: false, 
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    touchRatio: 1,
    simulateTouch: true,
    grabCursor: true,
    // Sem breakpoints, para verificar se há interferência
  });
});
