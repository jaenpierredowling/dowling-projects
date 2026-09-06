(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const form = document.querySelector('#quote-form');
  const status = document.querySelector('.form-status');
  const submitButton = document.querySelector('.submit-button');

  const trustTrack = document.querySelector('.capability-track');
  const trustRail = document.querySelector('.capability-rail');
  const touchViewport = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 1100px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The ticker stays compositor-driven while the user scrolls. We only pause it
  // when it is well outside the viewport, which saves work without making the
  // animation appear to freeze while someone scrolls past it.
  if (trustTrack && trustRail && !reducedMotion && 'IntersectionObserver' in window) {
    const tickerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        trustTrack.classList.toggle('is-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '160px 0px 160px 0px', threshold: 0 });
    tickerObserver.observe(trustRail);
  }

  document.addEventListener('visibilitychange', () => {
    if (!trustTrack || reducedMotion) return;
    trustTrack.classList.toggle('is-paused', document.hidden);
  });

  let headerScrolled = null;
  const updateHeader = () => {
    const next = window.scrollY > 30;
    if (next === headerScrolled) return;
    header?.classList.toggle('scrolled', next);
    headerScrolled = next;
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileMenu.classList.toggle('open', !open);
      document.body.classList.toggle('menu-open', !open);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  const reveals = document.querySelectorAll('.reveal');

  if (reducedMotion || touchViewport.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => {
      item.style.transitionDelay = '0ms';
      item.classList.add('visible');
    });
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((item, index) => {
      item.style.transitionDelay = touchViewport.matches ? '0ms' : `${Math.min(index % 5, 4) * 45}ms`;
      observer.observe(item);
    });
  }


  document.querySelectorAll('details').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('details').forEach((other) => {
        if (other !== item) other.removeAttribute('open');
      });
    });
  });

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      const fields = [...form.querySelectorAll('[required]')];
      let valid = true;
      fields.forEach((field) => {
        const fieldValid = field.checkValidity();
        field.setAttribute('aria-invalid', String(!fieldValid));
        if (!fieldValid) valid = false;
      });

      if (!valid) {
        status.textContent = 'Please complete the required fields before sending your request.';
        status.classList.add('error');
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      const payload = Object.fromEntries(new FormData(form).entries());
      submitButton.disabled = true;
      submitButton.classList.add('loading');

      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Unable to send your request.');

        form.reset();
        fields.forEach((field) => field.removeAttribute('aria-invalid'));
        status.textContent = 'Thanks. Your request has been sent to Anro. He will be in touch as soon as he can.';
        status.classList.add('success');
      } catch (error) {
        status.textContent = error.message || 'Something went wrong. Please WhatsApp Anro on +27 62 411 4413.';
        status.classList.add('error');
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
      }
    });
  }
})();
