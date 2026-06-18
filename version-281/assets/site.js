const mobileButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (mobileButton && mobileNav) {
  mobileButton.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
}

const hero = document.querySelector('[data-hero-slider]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let active = 0;
  let timer = null;

  const showSlide = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === active);
    });
  };

  const startTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(active + 1), 5600);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startTimer();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(active - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(active + 1);
      startTimer();
    });
  }

  showSlide(0);
  startTimer();
}

const filterInput = document.querySelector('[data-filter-input]');
const filterYear = document.querySelector('[data-filter-year]');
const filterType = document.querySelector('[data-filter-type]');
const filterCards = Array.from(document.querySelectorAll('.movie-card'));
const noResults = document.querySelector('[data-no-results]');

const applyFilters = () => {
  const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
  const year = filterYear ? filterYear.value : '';
  const type = filterType ? filterType.value : '';
  let visible = 0;

  filterCards.forEach((card) => {
    const title = (card.dataset.title || '').toLowerCase();
    const tags = (card.dataset.tags || '').toLowerCase();
    const cardYear = card.dataset.year || '';
    const cardType = card.dataset.type || '';
    const cardCategory = (card.dataset.category || '').toLowerCase();
    const matchesQuery = !query || title.includes(query) || tags.includes(query) || cardCategory.includes(query);
    const matchesYear = !year || cardYear === year;
    const matchesType = !type || cardType === type;
    const show = matchesQuery && matchesYear && matchesType;

    card.style.display = show ? '' : 'none';
    if (show) {
      visible += 1;
    }
  });

  if (noResults) {
    noResults.classList.toggle('visible', visible === 0);
  }
};

[filterInput, filterYear, filterType].forEach((control) => {
  if (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  }
});

const players = Array.from(document.querySelectorAll('[data-stream-player]'));

players.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const stream = player.dataset.stream;
  let loaded = false;
  let hlsInstance = null;

  const attachStream = () => {
    if (!video || !stream || loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      loaded = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      loaded = true;
    }
  };

  const startPlayback = () => {
    attachStream();
    if (button) {
      button.classList.add('hidden');
    }
    if (video) {
      video.controls = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }
  };

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
