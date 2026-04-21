// LESDK — front-end micro-interactions (vdart-style fade-ins + hero rotator)

(function () {
  "use strict";

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
