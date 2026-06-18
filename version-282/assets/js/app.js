(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    if (!header || !toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.slide || 0));
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupSearchAndFilters() {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    var grid = document.querySelector('[data-searchable-grid]');
    var empty = document.querySelector('.filter-empty');
    var activeYear = '';

    forms.forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      form.addEventListener('submit', function (event) {
        if (!grid) {
          return;
        }
        event.preventDefault();
        applyFilter(input ? input.value : '', activeYear);
      });
    });

    function applyFilter(query, year) {
      if (!grid) {
        return;
      }

      var terms = normalize(query).split(/\s+/).filter(Boolean);
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.region,
          card.textContent
        ].join(' '));
        var matchedQuery = terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
        var matchedYear = !year || card.dataset.year === year;
        var visible = matchedQuery && matchedYear;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.dataset.filterYear || '';
        yearButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        var searchInput = document.querySelector('.inline-search input[name="q"]');
        applyFilter(searchInput ? searchInput.value : initialQuery, activeYear);
      });
    });

    if (grid && initialQuery) {
      applyFilter(initialQuery, activeYear);
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var source = shell.dataset.hlsSrc;
      var hlsInstance = null;
      var isInitialized = false;

      if (!video || !overlay || !source) {
        return;
      }

      function initializePlayer() {
        if (isInitialized) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        video.setAttribute('controls', 'controls');
        isInitialized = true;
      }

      function playVideo() {
        initializePlayer();
        overlay.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }

      overlay.addEventListener('click', playVideo);
      shell.addEventListener('click', function (event) {
        if (event.target === video && !isInitialized) {
          playVideo();
        }
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupSearchAndFilters();
    setupPlayers();
  });
})();
