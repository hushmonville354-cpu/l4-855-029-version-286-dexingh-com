(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchList = document.querySelector('[data-search-list]');
    var searchForm = document.querySelector('[data-search-page-form]');

    function applySearch(value) {
        if (!searchList) {
            return;
        }
        var query = String(value || '').trim().toLowerCase();
        searchList.querySelectorAll('[data-search-card]').forEach(function (card) {
            var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
            card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;
        applySearch(initial);
        searchInput.addEventListener('input', function () {
            applySearch(searchInput.value);
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = searchInput ? searchInput.value.trim() : '';
            var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            window.history.replaceState(null, '', nextUrl);
            applySearch(value);
        });
    }

    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
        var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]'));
        var list = document.querySelector('[data-search-list]');

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                if (!list) {
                    return;
                }
                var value = button.getAttribute('data-filter-value') || 'all';
                list.querySelectorAll('[data-search-card]').forEach(function (card) {
                    var text = card.getAttribute('data-filter-text') || '';
                    card.classList.toggle('is-hidden', value !== 'all' && text.indexOf(value) === -1);
                });
            });
        });
    });
})();
