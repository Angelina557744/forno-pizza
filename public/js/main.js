(function () {
  const header = document.querySelector('.header');
  const burger = document.querySelector('[data-burger]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = !mobileNav.classList.contains('is-open');
      burger.classList.toggle('is-open', isOpen);
      mobileNav.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('is-locked', isOpen);
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('is-open');
        mobileNav.classList.remove('is-open');
        document.body.classList.remove('is-locked');
      });
    });
  }

  if (typeof Swiper !== 'undefined') {
    const reviewsSwiper = document.querySelector('.reviews-swiper');
    if (reviewsSwiper) {
      new Swiper(reviewsSwiper, {
        slidesPerView: 1.15,
        spaceBetween: 24,
        grabCursor: true,
        pagination: {
          el: '.reviews-swiper__pagination',
          clickable: true
        },
        breakpoints: {
          768: { slidesPerView: 2.15, spaceBetween: 28 },
          1100: { slidesPerView: 3, spaceBetween: 32 }
        }
      });
    }
  }
})();