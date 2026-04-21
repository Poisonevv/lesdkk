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

  // --- Services mega-menu: hover a category to swap right-side panel ----
  var servicesDD = document.querySelector(".services-dd");
  if (servicesDD) {
    var cats = servicesDD.querySelectorAll(".mega-cat");
    var panels = servicesDD.querySelectorAll(".mega-panel");
    function activateCat(slug) {
      cats.forEach(function (c) {
        c.classList.toggle("is-active", c.getAttribute("data-cat") === slug);
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === slug);
      });
    }
    cats.forEach(function (c) {
      c.addEventListener("mouseenter", function () {
        activateCat(c.getAttribute("data-cat"));
      });
      c.addEventListener("focus", function () {
        activateCat(c.getAttribute("data-cat"));
      });
    });
    // Reset to first category when dropdown closes
    servicesDD.addEventListener("mouseleave", function () {
      if (cats.length) activateCat(cats[0].getAttribute("data-cat"));
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

  // --- Contact form → Web3Forms (AJAX, inline success/error) -----------
  document.querySelectorAll("[data-contact-form]").forEach(function (form) {
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector("button[type=submit]");
    var originalLabel = submit ? (submit.getAttribute("data-submit-label") || submit.textContent) : "";

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.setAttribute("data-state", kind || "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Sending...";
      }
      setStatus("", "");

      var data = new FormData(form);
      fetch(form.action, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (result) {
          if (result.ok && result.json && result.json.success) {
            setStatus("Thanks — your message has been sent. We'll get back to you shortly.", "success");
            form.reset();
          } else {
            var msg = (result.json && result.json.message) || "Something went wrong. Please try again or email info@lesdk.com.";
            setStatus(msg, "error");
          }
        })
        .catch(function () {
          setStatus("Network error. Please try again or email info@lesdk.com.", "error");
        })
        .then(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = originalLabel;
          }
        });
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
    setLangCookie(savedLang);
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
