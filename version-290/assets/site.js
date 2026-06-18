(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function updateSearchActions() {
    qsa("form.site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs("input[name='q']", form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initMobileNav() {
    var button = qs(".mobile-menu-toggle");
    var panel = qs(".mobile-nav");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = qsa(".hero-slide");
    if (!slides.length) {
      return;
    }
    var dots = qsa(".hero-dot");
    var prev = qs(".hero-prev");
    var next = qs(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      slides[index].classList.remove("active");
      dots[index] && dots[index].classList.remove("active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("active");
      dots[index] && dots[index].classList.add("active");
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
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-slide"));
        if (!Number.isNaN(nextIndex)) {
          show(nextIndex);
          start();
        }
      });
    });

    prev && prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });

    next && next.addEventListener("click", function () {
      show(index + 1);
      start();
    });

    qs(".hero-carousel") && qs(".hero-carousel").addEventListener("mouseenter", stop);
    qs(".hero-carousel") && qs(".hero-carousel").addEventListener("mouseleave", start);
    start();
  }

  function createCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      "<a class=\"card-poster\" href=\"" + item.url + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"play-chip\">播放</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
      "<h2><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h2>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-row\"><span>" + escapeHtml(item.genre) + "</span></div>",
      "</div>"
    ].join("");
    return article;
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var grid = qs("#searchResultGrid");
    var input = qs("#searchInput");
    var summary = qs("#searchSummary");
    if (!grid || !input || !summary || !window.MOVIES_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;

    function render(term) {
      grid.innerHTML = "";
      var normalized = term.toLowerCase();
      var list = window.MOVIES_INDEX.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
        return !normalized || text.indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (!term) {
        summary.textContent = "输入关键词，搜索片名、年份、地区、类型与标签。";
        return;
      }

      if (!list.length) {
        summary.textContent = "未找到匹配影片。";
        return;
      }

      summary.textContent = "为你找到相关影片：";
      list.forEach(function (item) {
        grid.appendChild(createCard(item));
      });
    }

    render(query);
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateSearchActions();
    initMobileNav();
    initHero();
    initSearchPage();
  });
})();
