/* Cartier Orthodontics landing page — small progressive enhancements.
   Tracking tags live in the page <head>; nothing here changes them. */
(function () {
  'use strict';

  var FORM_ID = '3PoF8FP86X7OfRoyfHb0';
  var frame = document.getElementById('inline-' + FORM_ID);

  /* ---- Form: resize + redirect to /thank-you on submit ------------------
     Same detection logic as the existing page, which sends the visitor to
     /thank-you (where the lead conversion fires) once the SmileHub form
     reports a submission. The current URL parameters are carried along. */
  var redirected = false;
  function goToThankYou() {
    if (redirected) return;
    redirected = true;
    window.location.href = new URL('thank-you' + window.location.search, window.location.href).href;
  }

  if (frame) {
    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data) return;

      if (typeof data === 'object' && typeof data.height === 'number') {
        frame.style.height = Math.max(data.height, 560) + 'px';
      }

      var submitted = false;
      if (Array.isArray(data) && data[0] === 'set-sticky-contacts') submitted = true;

      var parsed = data;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (err) {
          if (parsed.indexOf('set-sticky-contacts') !== -1 ||
              parsed.indexOf('form-submit') !== -1 ||
              parsed.indexOf('leadCollected') !== -1) submitted = true;
        }
      }
      if (parsed && typeof parsed === 'object' && (
          parsed.type === 'form-submit' || parsed.event === 'form-submit' ||
          parsed.action === 'form-submit' || parsed.action === 'set-sticky-contacts' ||
          parsed.isFormSubmitted || parsed.leadCollected)) submitted = true;

      if (submitted) goToThankYou();
    });
  }

  /* ---- Header hairline once the page is scrolled ------------------------ */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Fade-in on scroll ------------------------------------------------ */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Mobile bar: step aside while the booking form is on screen ------- */
  var bar = document.querySelector('[data-mobile-bar]');
  var formCard = document.getElementById('book');
  if (bar && formCard && 'IntersectionObserver' in window) {
    // "On screen" = the form card crosses the middle band of the viewport.
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 }).observe(formCard);
  }

  /* ---- Placeholder links should not jump the page ----------------------- */
  document.querySelectorAll('[data-placeholder]').forEach(function (link) {
    link.addEventListener('click', function (event) { event.preventDefault(); });
  });

  /* ---- Copyright year (the existing page renders the current year) ------ */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
