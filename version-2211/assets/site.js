(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function closeMobilePanel() {
    var panel = document.querySelector('[data-mobile-panel]');
    if (panel) {
      panel.classList.remove('open');
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
    selectAll('.mobile-link', panel).forEach(function (link) {
      link.addEventListener('click', closeMobilePanel);
    });
  }

  function initHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    start();
  }

  function initSearch() {
    var layer = document.querySelector('[data-search-layer]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    if (!layer || !input || !results) {
      return;
    }

    function open() {
      closeMobilePanel();
      layer.classList.add('open');
      layer.setAttribute('aria-hidden', 'false');
      input.focus();
      render(input.value);
    }

    function close() {
      layer.classList.remove('open');
      layer.setAttribute('aria-hidden', 'true');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function resultCard(item) {
      return '<a class="search-result" href="' + escapeHtml(item.url) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '<span>' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(item.oneLine) + '</span>' +
          '<small>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</small>' +
        '</span>' +
      '</a>';
    }

    function render(query) {
      var q = normalize(query);
      var data = window.SEARCH_INDEX || [];
      var matches = data;
      if (q) {
        matches = data.filter(function (item) {
          return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags + ' ' + item.oneLine).indexOf(q) !== -1;
        });
      }
      matches = matches.slice(0, 36);
      if (!matches.length) {
        results.innerHTML = '<div class="no-result">没有找到匹配影片</div>';
        return;
      }
      results.innerHTML = matches.map(resultCard).join('');
    }

    selectAll('[data-search-open]').forEach(function (button) {
      button.addEventListener('click', open);
    });

    var closeButton = document.querySelector('[data-search-close]');
    if (closeButton) {
      closeButton.addEventListener('click', close);
    }

    layer.addEventListener('click', function (event) {
      if (event.target === layer) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close();
      }
    });

    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
