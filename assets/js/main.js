/* Cartier Orthodontics landing page — small progressive enhancements.
   Tracking tags live in the page <head>; nothing here changes them. */
(function () {
  'use strict';

  var FORM_ID = '3PoF8FP86X7OfRoyfHb0';
  var FORM_NAME = 'LPF - Basic $500 Off + Complimentary Teeth Whitening - New';
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // The form reports a height that is a little shorter than its own page, which
  // leaves a scrollbar inside the frame. Keep each frame taller than the report.
  var FORM_FRAMES = ['inline-' + FORM_ID, 'modal-' + FORM_ID];
  var FORM_HEIGHT_BUFFER = 72;
  function fitFrame(frame, reported) {
    if (frame && reported > 0) frame.style.minHeight = Math.ceil(reported + FORM_HEIGHT_BUFFER) + 'px';
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data) return;

    // "[iFrameSizer]<iframe id>:<height>:<width>:<type>" from the SmileHub embed.
    if (typeof data === 'string' && data.indexOf('[iFrameSizer]') === 0) {
      var parts = data.slice('[iFrameSizer]'.length).split(':');
      if (FORM_FRAMES.indexOf(parts[0]) !== -1) fitFrame(document.getElementById(parts[0]), parseFloat(parts[1]));
    }
    // Older message shape the existing page listened for.
    if (typeof data === 'object' && typeof data.height === 'number') {
      FORM_FRAMES.forEach(function (id) {
        var frame = document.getElementById(id);
        if (frame && frame.contentWindow === event.source) fitFrame(frame, data.height);
      });
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

  /* ---- Booking popup -----------------------------------------------------
     Every "Book Free Consultation" button opens the form in a dialog. The
     iframe is created on first open with the same id and attributes the
     existing page uses for its popup form. Without <dialog> support (or
     without JS) the buttons simply jump to the form above the footer. */
  var dialog = document.getElementById('book-dialog');
  var dialogFrameHost = dialog && dialog.querySelector('[data-dialog-frame]');

  function buildModalFrame() {
    var id = 'modal-' + FORM_ID;
    var frame = document.createElement('iframe');
    frame.src = 'https://link.smilehub.io/widget/form/' + FORM_ID;
    frame.id = id;
    frame.title = FORM_NAME;
    frame.setAttribute('data-layout', '{"id":"INLINE"}');
    frame.setAttribute('data-trigger-type', 'alwaysShow');
    frame.setAttribute('data-trigger-value', '');
    frame.setAttribute('data-activation-type', 'alwaysActivated');
    frame.setAttribute('data-activation-value', '');
    frame.setAttribute('data-deactivation-type', 'neverDeactivate');
    frame.setAttribute('data-deactivation-value', '');
    frame.setAttribute('data-form-name', FORM_NAME);
    frame.setAttribute('data-layout-iframe-id', id);
    frame.setAttribute('data-form-id', FORM_ID);
    frame.setAttribute('data-cookie-consent', 'true');
    frame.setAttribute('data-cookie-consent-provider', 'auto');
    frame.style.width = '100%';
    frame.style.height = '700px';
    frame.style.border = 'none';
    return frame;
  }

  if (dialog && dialogFrameHost && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-book]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        if (!dialogFrameHost.firstChild) dialogFrameHost.appendChild(buildModalFrame());
        if (!dialog.open) dialog.showModal();
        document.documentElement.classList.add('dialog-open');
      });
    });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('dialog-open');
    });
    // Click on the dimmed backdrop closes the popup.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    var closeButton = dialog.querySelector('[data-dialog-close]');
    if (closeButton) closeButton.addEventListener('click', function () { dialog.close(); });
  }

  /* ---- Hero video ---------------------------------------------------------
     Starts muted once the page has loaded (never for reduced-motion users),
     with simple play/pause and sound buttons. */
  var video = document.querySelector('[data-hero-video]');
  var videoControls = document.querySelector('[data-video-controls]');
  if (video && videoControls) {
    var playButton = videoControls.querySelector('[data-video-play]');
    var muteButton = videoControls.querySelector('[data-video-mute]');
    var setIcon = function (button, icon, label) {
      button.querySelector('use').setAttribute('href', '#' + icon);
      button.setAttribute('aria-label', label);
    };
    var syncPlay = function () {
      setIcon(playButton, video.paused ? 'i-play' : 'i-pause', video.paused ? 'Play video' : 'Pause video');
    };
    var syncMute = function () {
      setIcon(muteButton, video.muted ? 'i-muted' : 'i-sound', video.muted ? 'Unmute video' : 'Mute video');
    };

    video.removeAttribute('controls');
    videoControls.hidden = false;
    video.addEventListener('play', syncPlay);
    video.addEventListener('pause', syncPlay);
    video.addEventListener('volumechange', syncMute);
    playButton.addEventListener('click', function () {
      if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } else { video.pause(); }
    });
    muteButton.addEventListener('click', function () { video.muted = !video.muted; });
    syncPlay();
    syncMute();

    if (!reducedMotion) {
      var autoStart = function () {
        video.muted = true;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      };
      if (document.readyState === 'complete') autoStart();
      else window.addEventListener('load', autoStart);
    }
  }

  /* ---- Reviews ticker -----------------------------------------------------
     Clones the review cards into a seamless loop that drifts slowly and
     pauses on hover, keyboard focus, touch, or the Pause button, so the
     full reviews can be read. Reduced-motion users keep the static cards. */
  var ticker = document.querySelector('[data-ticker]');
  var track = ticker && ticker.querySelector('[data-ticker-track]');
  var tickerToggle = document.querySelector('[data-ticker-toggle]');
  if (ticker && track && !reducedMotion) {
    var originals = Array.prototype.slice.call(track.children);
    ticker.classList.add('is-ticker');

    var setWidth = 0;
    originals.forEach(function (card) {
      var style = window.getComputedStyle(card);
      setWidth += card.getBoundingClientRect().width + parseFloat(style.marginRight || 0);
    });

    if (setWidth > 0) {
      // Each half of the track must be at least as wide as the widest screen.
      var widest = Math.max(window.innerWidth, (window.screen && window.screen.width) || 0);
      var setsPerHalf = Math.max(1, Math.ceil(widest / setWidth));
      for (var n = 1; n < setsPerHalf * 2; n++) {
        originals.forEach(function (card) {
          var clone = card.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.removeAttribute('role');
          track.appendChild(clone);
        });
      }
      var SPEED = window.innerWidth < 640 ? 26 : 38; // px per second
      track.style.setProperty('--ticker-duration', Math.round((setWidth * setsPerHalf) / SPEED) + 's');

      var userPaused = false;
      var touchPaused = false;
      var touchTimer = null;
      var updatePaused = function () {
        ticker.classList.toggle('is-paused', userPaused || touchPaused);
      };
      // Touch screens have no hover: hold a finger on the reviews to stop them,
      // and they move on a few seconds after it lifts.
      ticker.addEventListener('touchstart', function () {
        window.clearTimeout(touchTimer);
        touchPaused = true;
        updatePaused();
      }, { passive: true });
      var releaseTouch = function () {
        window.clearTimeout(touchTimer);
        touchTimer = window.setTimeout(function () { touchPaused = false; updatePaused(); }, 4000);
      };
      ticker.addEventListener('touchend', releaseTouch, { passive: true });
      ticker.addEventListener('touchcancel', releaseTouch, { passive: true });

      if (tickerToggle) {
        tickerToggle.hidden = false;
        tickerToggle.addEventListener('click', function () {
          userPaused = !userPaused;
          tickerToggle.setAttribute('aria-pressed', String(userPaused));
          tickerToggle.querySelector('use').setAttribute('href', userPaused ? '#i-play' : '#i-pause');
          tickerToggle.querySelector('span').textContent = userPaused ? 'Play' : 'Pause';
          updatePaused();
        });
      }
    } else {
      ticker.classList.remove('is-ticker');
    }
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
  var bookSection = document.getElementById('book');
  if (bar && bookSection && 'IntersectionObserver' in window) {
    // "On screen" = the form section crosses the middle band of the viewport.
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 }).observe(bookSection);
  }

  /* ---- Placeholder links should not jump the page ----------------------- */
  document.querySelectorAll('[data-placeholder]').forEach(function (link) {
    link.addEventListener('click', function (event) { event.preventDefault(); });
  });

  /* ---- Smooth wheel scrolling ---------------------------------------------
     Eases mouse-wheel / trackpad scrolling toward its target instead of
     jumping. It drives the browser's own scroll position (no transforms), so
     sticky elements, lazy images and the fade-ins behave exactly as before.
     Only for mouse/trackpad devices; touch screens keep native momentum and
     reduced-motion users keep native scrolling. */
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reducedMotion && window.requestAnimationFrame) {
    var EASE_MS = 120;            // lower = snappier, higher = lazier
    var scrollTarget = 0;
    var scrollCurrent = 0;
    var scrollFrame = null;
    var lastFrameTime = 0;

    var jumpTo = function (y) {
      try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }
      catch (err) { window.scrollTo(0, y); }
    };
    var stopSmoothScroll = function () {
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    };
    var stepSmoothScroll = function (now) {
      var dt = Math.min(now - lastFrameTime, 64);
      lastFrameTime = now;
      scrollCurrent += (scrollTarget - scrollCurrent) * (1 - Math.exp(-dt / EASE_MS));
      if (Math.abs(scrollTarget - scrollCurrent) < 0.5) {
        jumpTo(scrollTarget);
        scrollFrame = null;
        return;
      }
      jumpTo(scrollCurrent);
      scrollFrame = window.requestAnimationFrame(stepSmoothScroll);
    };

    window.addEventListener('wheel', function (event) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      // Leave the popup (and anything else that scrolls on its own) alone.
      if ((dialog && dialog.open) || (event.target.closest && event.target.closest('dialog'))) return;

      var delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 40;
      else if (event.deltaMode === 2) delta *= window.innerHeight;

      var limit = document.documentElement.scrollHeight - window.innerHeight;
      if (!scrollFrame) scrollTarget = scrollCurrent = window.scrollY;
      scrollTarget = Math.max(0, Math.min(limit, scrollTarget + delta));

      event.preventDefault();
      if (!scrollFrame) {
        lastFrameTime = window.performance.now();
        scrollFrame = window.requestAnimationFrame(stepSmoothScroll);
      }
    }, { passive: false });

    // Any other way of scrolling (keyboard, scrollbar drag, in-page links) takes over immediately.
    ['keydown', 'mousedown', 'touchstart'].forEach(function (type) {
      window.addEventListener(type, stopSmoothScroll, { passive: true });
    });
    window.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('a[href^="#"]')) stopSmoothScroll();
    }, true);
  }

  /* ---- Copyright year (the existing page renders the current year) ------ */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
