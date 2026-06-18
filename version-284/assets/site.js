(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var input = document.querySelector('[data-search-input]');
  var genre = document.querySelector('[data-filter-genre]');
  var year = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilters() {
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var selectedGenre = genre ? genre.value.trim() : '';
    var selectedYear = year ? year.value.trim() : '';

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var cardGenre = card.getAttribute('data-genre') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchGenre = !selectedGenre || cardGenre.indexOf(selectedGenre) !== -1 || haystack.indexOf(selectedGenre.toLowerCase()) !== -1;
      var matchYear = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
      card.classList.toggle('is-filtered-out', !(matchKeyword && matchGenre && matchYear));
    });
  }

  [input, genre, year].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
})();
