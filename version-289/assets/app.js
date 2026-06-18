(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function setupLocalFilters() {
        document.querySelectorAll("[data-local-filter]").forEach(function (input) {
            var targetId = input.getAttribute("data-local-filter");
            var target = document.getElementById(targetId);
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-filter-text]"));
            input.addEventListener("input", function () {
                var q = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-filter-text") || "";
                    card.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
                });
            });
        });
    }

    function cardHtml(item) {
        return [
            '<article class="movie-card">',
            '<a class="poster-wrap" href="./' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
            '<span class="play-dot">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta">' + item.year + ' · ' + item.region + '</div>',
            '<h3><a href="./' + item.url + '">' + item.title + '</a></h3>',
            '<p>' + item.oneLine + '</p>',
            '</div>',
            '</article>'
        ].join("");
    }

    function renderSearchPage() {
        var box = document.querySelector("[data-search-results]");
        if (!box || !window.siteSearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim().toLowerCase();
        var input = document.querySelector("[data-search-input]");
        if (input) {
            input.value = params.get("q") || "";
        }
        if (!q) {
            box.innerHTML = '<div class="empty-state">请输入关键词进行搜索</div>';
            return;
        }
        var words = q.split(/\s+/).filter(Boolean);
        var results = window.siteSearchIndex.filter(function (item) {
            var text = item.searchText;
            return words.every(function (word) {
                return text.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        if (!results.length) {
            box.innerHTML = '<div class="empty-state">未找到相关内容</div>';
            return;
        }
        box.innerHTML = results.map(cardHtml).join("");
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupLocalFilters();
        renderSearchPage();
    });
})();

function setupMoviePlayer(videoId, maskId, streamUrl) {
    var video = document.getElementById(videoId);
    var mask = document.getElementById(maskId);
    if (!video || !mask || !streamUrl) {
        return;
    }
    var prepared = false;
    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }
    function play() {
        prepare();
        mask.classList.add("is-hidden");
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                mask.classList.remove("is-hidden");
            });
        }
    }
    mask.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        mask.classList.add("is-hidden");
    });
}