document.addEventListener('DOMContentLoaded', function () {
    const swiperManager = new Swiper('.meu-carrossel', {
        loop: true,
        autoplay: {
            delay: 8000,
            disableOnInteraction: false, 
        },
        slidesPerView: 3,
        slidesPerGroup: 1,
        spaceBetween: 30,
        navigation: {
            nextEl: '.meu-carrossel-button-next',
            prevEl: '.meu-carrossel-button-prev',
        },
    });
});
  