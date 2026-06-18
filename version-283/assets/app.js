(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var links = document.querySelector('.nav-links');
        var search = document.querySelector('.nav-search');
        if (!toggle || !links || !search) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
            search.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initFilters() {
        var input = document.querySelector('[data-local-search]');
        var list = document.querySelector('[data-card-list]');
        if (!input || !list) {
            return;
        }
        var cards = selectAll('.movie-card', list);
        var year = document.querySelector('[data-filter-year]');
        var type = document.querySelector('[data-filter-type]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
        }
        function apply() {
            var q = normalize(input.value);
            var y = year ? normalize(year.value) : '';
            var t = type ? normalize(type.value) : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchQuery = !q || haystack.indexOf(q) !== -1;
                var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
                var matchType = !t || normalize(card.getAttribute('data-type')) === t;
                var show = matchQuery && matchYear && matchType;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        input.addEventListener('input', apply);
        if (year) {
            year.addEventListener('change', apply);
        }
        if (type) {
            type.addEventListener('change', apply);
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
