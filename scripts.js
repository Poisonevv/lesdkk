// LESDK — front-end micro-interactions (vdart-style fade-ins + hero rotator)

(function () {
  "use strict";

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

  // --- Contact form → mailto with captured fields -----------------------
  document.querySelectorAll("[data-contact-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = form.getAttribute("data-contact-to") || "lesdkofficial@gmail.com";
      var name = (form.querySelector("#name") || {}).value || "";
      var email = (form.querySelector("#email") || {}).value || "";
      var service = (form.querySelector("#service") || {}).value || "";
      var msg = (form.querySelector("#msg") || {}).value || "";
      var subject = "LESDK inquiry — " + (service || "General") + (name ? " (" + name + ")" : "");
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Area of Interest: " + service + "\n\n" +
        "Message:\n" + msg + "\n";
      var url = "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = url;
    });
  });

  // --- FR | EN language switch (Google Translate) ----------------------
  function setLangCookie(lang) {
    var value = lang === "en" ? "/en/en" : "/en/" + lang;
    var hostname = location.hostname;
    var parts = hostname.split(".");
    var domains = ["", hostname];
    if (parts.length >= 2) domains.push("." + parts.slice(-2).join("."));
    domains.forEach(function (d) {
      var suffix = d ? "; domain=" + d : "";
      document.cookie = "googtrans=" + value + "; path=/" + suffix;
    });
  }
  function applyLang(lang) {
    setLangCookie(lang);
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem("lesdk_lang", lang); } catch (e) {}
    location.reload();
  }
  var savedLang = null;
  try { savedLang = localStorage.getItem("lesdk_lang"); } catch (e) {}
  if (savedLang === "fr" || savedLang === "en") {
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === savedLang);
    });
  }
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      if (!lang) return;
      applyLang(lang);
    });
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
