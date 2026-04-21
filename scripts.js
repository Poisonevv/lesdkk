// LESDK — front-end micro-interactions (vdart-style fade-ins + hero rotator)

(function () {
  "use strict";

  // --- Top-bar: visible at top, hide on scroll-down, show on scroll-up --
  var topBar = document.querySelector("[data-top-bar]");
  if (topBar) {
    var lastY = window.scrollY;
    var ticking = false;
    function syncTopBar() {
      var y = window.scrollY;
      if (y <= 4) {
        topBar.classList.add("is-visible");
      } else if (y > lastY + 2) {
        topBar.classList.remove("is-visible");
      } else if (y < lastY - 2) {
        topBar.classList.add("is-visible");
      }
      lastY = y;
      ticking = false;
    }
    topBar.classList.add("is-visible");
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(syncTopBar);
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Mobile nav toggle -------------------------------------------------
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.tagName === "A" && !t.classList.contains("dd-top")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // --- Scroll reveal -----------------------------------------------------
  var revealables = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: reveal everything immediately.
    revealables.forEach(function (el) { el.classList.add("in-view"); });
  }

  // --- Case-study slider -------------------------------------------------
  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector(".slider-track");
    var prev = slider.querySelector(".slider-prev");
    var next = slider.querySelector(".slider-next");
    var dotsHost = slider.parentElement.querySelector("[data-slider-dots]");
    if (!track) return;

    function slideWidth() {
      var slide = track.querySelector(".slide");
      if (!slide) return 300;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return slide.getBoundingClientRect().width + gap;
    }

    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: slideWidth(), behavior: "smooth" });
    });
    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -slideWidth(), behavior: "smooth" });
    });

    if (dotsHost) {
      var slides = track.querySelectorAll(".slide");
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", function () {
          track.scrollTo({ left: slideWidth() * i, behavior: "smooth" });
        });
        dotsHost.appendChild(dot);
      });
      var dots = dotsHost.querySelectorAll("button");
      if (dots.length) dots[0].classList.add("is-active");
      track.addEventListener("scroll", function () {
        var i = Math.round(track.scrollLeft / slideWidth());
        dots.forEach(function (d, di) { d.classList.toggle("is-active", di === i); });
      });
    }
  });

  // --- Hero tagline rotator ---------------------------------------------
  var rotator = document.querySelector(".hero-rotator");
  if (rotator) {
    var slides = rotator.querySelectorAll("h1");
    if (slides.length > 1) {
      var idx = 0;
      slides[0].classList.add("is-active");
      setInterval(function () {
        slides[idx].classList.remove("is-active");
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add("is-active");
      }, 4000);
    } else if (slides.length === 1) {
      slides[0].classList.add("is-active");
    }
  }
})();
