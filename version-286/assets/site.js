(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function htmlEscape(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function cardTemplate(movie) {
    return '<article class="movie-card" data-search="' + htmlEscape(normalize(movie.title + ' ' + movie.oneLine + ' ' + movie.genre + ' ' + movie.tags.join(' '))) + '" data-year="' + htmlEscape(movie.yearScore || movie.year) + '" data-title="' + htmlEscape(movie.title) + '">' +
      '<a href="' + htmlEscape(movie.file) + '" class="card-cover" aria-label="' + htmlEscape(movie.title) + '">' +
      '<img src="' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">' +
      '<span class="card-year">' + htmlEscape(movie.year) + '</span></a>' +
      '<div class="card-body"><a class="card-category" href="' + htmlEscape(movie.categoryFile) + '">' + htmlEscape(movie.category) + '</a>' +
      '<h3><a href="' + htmlEscape(movie.file) + '">' + htmlEscape(movie.title) + '</a></h3>' +
      '<p>' + htmlEscape(movie.oneLine.length > 86 ? movie.oneLine.slice(0, 86) + '…' : movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + htmlEscape(movie.region) + '</span><span>' + htmlEscape(movie.type) + '</span></div></div></article>';
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) return;
    var index = 0;
    function show(next) {
      slides[index].classList.remove('active');
      dots[index].classList.remove('active');
      index = next;
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function initPageFilter() {
    var filter = qs('#page-filter');
    var grid = qs('#movie-grid');
    var sorter = qs('#sort-select');
    if (!grid) return;
    var cards = qsa('.movie-card', grid);
    function applyFilter() {
      var term = normalize(filter ? filter.value : '');
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        card.classList.toggle('is-hidden', term && haystack.indexOf(term) === -1);
      });
    }
    function applySort() {
      if (!sorter) return;
      var value = sorter.value;
      var sorted = cards.slice();
      if (value === 'year-desc') {
        sorted.sort(function (a, b) { return Number(b.dataset.year || 0) - Number(a.dataset.year || 0); });
      } else if (value === 'year-asc') {
        sorted.sort(function (a, b) { return Number(a.dataset.year || 0) - Number(b.dataset.year || 0); });
      } else if (value === 'title') {
        sorted.sort(function (a, b) { return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN'); });
      }
      sorted.forEach(function (card) { grid.appendChild(card); });
      cards = qsa('.movie-card', grid);
      applyFilter();
    }
    if (filter) filter.addEventListener('input', applyFilter);
    if (sorter) sorter.addEventListener('change', applySort);
  }

  function initSearchPage() {
    var results = qs('#search-results');
    if (!results || !window.MOVIE_INDEX) return;
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = qs('#search-input');
    var title = qs('#search-title');
    var desc = qs('#search-desc');
    if (input) input.value = query;
    var term = normalize(query);
    if (!term) return;
    var matches = window.MOVIE_INDEX.filter(function (movie) {
      var haystack = normalize(movie.title + ' ' + movie.oneLine + ' ' + movie.category + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags.join(' '));
      return haystack.indexOf(term) !== -1;
    }).slice(0, 120);
    if (title) title.textContent = '“' + query + '” 的搜索结果';
    if (desc) desc.textContent = matches.length ? '已匹配到相关影片，点击卡片进入详情页。' : '没有匹配到相关影片，可以尝试更换关键词。';
    results.innerHTML = matches.length ? matches.map(cardTemplate).join('') : '<div class="empty-state">没有匹配到相关影片</div>';
  }

  window.initMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    var button = document.querySelector('[data-player-button="' + videoId + '"]');
    if (!video || !source) return;
    function hideButton() {
      if (button) button.classList.add('hidden');
    }
    function playVideo() {
      hideButton();
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {
          if (button) button.classList.remove('hidden');
        });
      }
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    if (button) {
      button.addEventListener('click', playVideo);
    }
    video.addEventListener('play', hideButton);
    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) button.classList.remove('hidden');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initPageFilter();
    initSearchPage();
  });
})();
