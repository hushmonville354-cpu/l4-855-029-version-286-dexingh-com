(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNavigation() {
        var button = qs('[data-mobile-menu-button]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        qsa('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('[data-hero-slide]', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function setupLiveFilters() {
        qsa('[data-live-filter]').forEach(function (filterRoot) {
            var input = qs('[data-filter-input]', filterRoot);
            var list = qs('[data-filter-list]', filterRoot.parentElement) || qs('[data-filter-list]');
            var count = qs('[data-filter-count]', filterRoot);
            var empty = qs('[data-filter-empty]', filterRoot.parentElement) || qs('[data-filter-empty]');
            if (!input || !list) {
                return;
            }
            var cards = qsa('[data-title]', list);
            var queryName = filterRoot.getAttribute('data-read-query');
            if (queryName) {
                var params = new URLSearchParams(window.location.search);
                var queryValue = params.get(queryName);
                if (queryValue) {
                    input.value = queryValue;
                }
            }

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function cardText(card) {
                return normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.textContent
                ].join(' '));
            }

            function applyFilter() {
                var keyword = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible;
                }
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    }

    function loadHlsLibrary() {
        return new Promise(function (resolve) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            var script = document.createElement('script');
            var finished = false;
            function done(result) {
                if (!finished) {
                    finished = true;
                    resolve(result);
                }
            }
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                done(window.Hls || null);
            };
            script.onerror = function () {
                done(null);
            };
            document.head.appendChild(script);
            window.setTimeout(function () {
                done(window.Hls || null);
            }, 2500);
        });
    }

    function setupPlayers() {
        qsa('.js-video-player').forEach(function (player) {
            var video = qs('video', player);
            var button = qs('[data-play-button]', player);
            var hlsSrc = player.getAttribute('data-hls-src');
            var fallbackSrc = player.getAttribute('data-fallback-src');
            var started = false;
            if (!video || !button) {
                return;
            }

            function useFallback() {
                if (fallbackSrc) {
                    video.src = fallbackSrc;
                    video.play().catch(function () {});
                }
            }

            async function startPlayback() {
                if (started) {
                    video.play().catch(function () {});
                    return;
                }
                started = true;
                button.classList.add('is-hidden');

                if (!hlsSrc) {
                    useFallback();
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = hlsSrc;
                    video.play().catch(useFallback);
                    return;
                }

                var Hls = await loadHlsLibrary();
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(hlsSrc);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            hls.destroy();
                            useFallback();
                        }
                    });
                } else {
                    useFallback();
                }
            }

            button.addEventListener('click', startPlayback);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNavigation();
        setupSearchForms();
        setupHeroCarousel();
        setupLiveFilters();
        setupPlayers();
    });
})();
