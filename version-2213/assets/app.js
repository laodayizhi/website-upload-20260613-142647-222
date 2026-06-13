(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        showSlide(0);
        start();
    }

    function setupSearchForms() {
        document.querySelectorAll(".search-form").forEach(function (form) {
            form.addEventListener("submit", function () {
                var input = form.querySelector("input[name='q']");
                if (input) {
                    input.value = input.value.trim();
                }
            });
        });
    }

    function setupCardFilters() {
        document.querySelectorAll("[data-filter-group]").forEach(function (group) {
            var cards = Array.prototype.slice.call(group.querySelectorAll("[data-search]"));
            var textInput = group.querySelector("[data-card-search]");
            var yearSelect = group.querySelector("[data-filter-year]");
            var typeSelect = group.querySelector("[data-filter-type]");
            var empty = group.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (textInput && initialQuery) {
                textInput.value = initialQuery;
            }

            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function applyFilter() {
                var query = normalize(textInput ? textInput.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
            applyFilter();
        });
    }

    function setupPlayerStart() {
        document.querySelectorAll("a[href='#player']").forEach(function (link) {
            link.addEventListener("click", function () {
                var button = document.querySelector(".player-overlay");
                if (button) {
                    window.setTimeout(function () {
                        button.focus({ preventScroll: true });
                    }, 450);
                }
            });
        });
    }

    window.initializeMoviePlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var shell = document.querySelector(".player-shell");
        var overlay = document.querySelector(".player-overlay");
        if (!video || !shell || !overlay || !streamUrl) {
            return;
        }

        var started = false;
        var hlsInstance = null;

        function attachStream() {
            if (started) {
                return;
            }
            started = true;
            video.setAttribute("controls", "controls");
            shell.classList.add("is-ready");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = streamUrl;
            video.play().catch(function () {});
        }

        overlay.addEventListener("click", attachStream);
        video.addEventListener("click", function () {
            if (!started) {
                attachStream();
                return;
            }
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    onReady(function () {
        setupMobileNav();
        setupHeroSlider();
        setupSearchForms();
        setupCardFilters();
        setupPlayerStart();
    });
})();
