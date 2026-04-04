/* main.js — Interactions + scroll effects */
(function () {
  'use strict';

  /* ===== Reduced motion check ===== */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Page loader ===== */
  const pageLoader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    if (pageLoader) {
      pageLoader.classList.add('is-hidden');
    }
    setTimeout(() => {
      document.querySelectorAll('.canvas-loader').forEach(l => l.classList.add('is-hidden'));
    }, 1500);
  });

  /* ===== Navbar scroll + progress bar ===== */
  const navbar = document.getElementById('navbar');
  const navProgress = document.getElementById('navProgress');

  function updateNavbar() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 40);

    // Progress bar
    if (navProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0;
      navProgress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });

  /* ===== Scroll-spy — highlight active nav link ===== */
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.navbar__links a[href^="#"]');

  function updateScrollSpy() {
    const scrollY = window.scrollY + 120;
    let currentId = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinksAll.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', updateScrollSpy, { passive: true });

  /* ===== Mobile toggle ===== */
  const toggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !toggle.contains(e.target)) {
        navLinks.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ===== IntersectionObserver — reveal system ===== */
  const revealOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOpts);

  document.querySelectorAll('.reveal, .reveal-stagger, .reveal-scale, .process').forEach(el => {
    revealObserver.observe(el);
  });

  /* ===== Hero parallax on scroll ===== */
  const heroContent = document.querySelector('.hero__content');
  const heroScroll  = document.querySelector('.hero__scroll');

  if (!prefersReduced) {
    function heroParallax() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      if (scrollY > vh) return;

      const ratio = scrollY / vh;

      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * .3}px)`;
        heroContent.style.opacity = 1 - ratio * 1.2;
      }
      if (heroScroll) {
        heroScroll.style.opacity = 1 - ratio * 2;
      }
    }
    window.addEventListener('scroll', heroParallax, { passive: true });
  }

  /* ===== Smooth anchor scroll ===== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (navLinks) navLinks.classList.remove('active');
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ===== Counter animations ===== */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      let progress = Math.min(elapsed / duration, 1);
      progress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(target * progress);
      el.textContent = current.toLocaleString('es-ES') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => {
    counterObserver.observe(el);
  });

  /* ===== Card spotlight follow cursor + 3D tilt ===== */
  function addSpotlightAndTilt(selector) {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');

        // 3D tilt effect
        if (!prefersReduced) {
          const tiltX = ((y - 50) / 50) * -4;
          const tiltY = ((x - 50) / 50) * 4;
          card.classList.add('is-tilting');
          card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  addSpotlightAndTilt('.data-card');
  addSpotlightAndTilt('.problem-card');
  addSpotlightAndTilt('.tech-panel');
  addSpotlightAndTilt('.verify-card');

  // Spotlight only (no tilt) for smaller elements
  function addSpotlight(selector) {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  addSpotlight('.product-spec');
  addSpotlight('.product-fbar__item');
  addSpotlight('.explorer__step');

  /* ===== Glow separators animate on scroll ===== */
  const glowSeps = document.querySelectorAll('.glow-separator');
  const glowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.style.opacity = entry.isIntersecting ? '.4' : '.1';
    });
  }, { threshold: 0.5 });
  glowSeps.forEach(el => glowObserver.observe(el));

  /* ===== Scroll-to-top button ===== */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== Contact form ===== */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.elements.name.value.trim();
      const email = contactForm.elements.email.value.trim();
      const message = contactForm.elements.message.value.trim();

      // Basic validation
      if (!name || !email || !message) {
        contactStatus.textContent = 'Por favor, completa todos los campos obligatorios.';
        contactStatus.className = 'contact-form__status contact-form__status--error';
        return;
      }
      // Simple email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        contactStatus.textContent = 'Introduce un email válido.';
        contactStatus.className = 'contact-form__status contact-form__status--error';
        return;
      }

      // Simulate send (replace with real endpoint)
      const submitBtn = document.getElementById('contactSubmit');
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');

      setTimeout(() => {
        contactStatus.textContent = '¡Mensaje enviado correctamente! Te responderemos pronto.';
        contactStatus.className = 'contact-form__status contact-form__status--success';
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        contactForm.reset();
      }, 1200);
    });
  }

  /* ===== Lazy-init 3D scenes via IntersectionObserver ===== */
  function lazyInitScene(canvasId, loaderId) {
    const canvas = document.getElementById(canvasId);
    const loader = document.getElementById(loaderId);
    if (!canvas) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Scene scripts already loaded; just hide loader
          if (loader) setTimeout(() => loader.classList.add('is-hidden'), 800);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(canvas.parentElement);
  }

  // hero-canvas removed (replaced with CSS pipeline); only init product + explorer
  lazyInitScene('productCanvas', 'productLoader');
  lazyInitScene('explorerCanvas', 'explorerLoader');

  /* ===== Pause 3D rendering when tab is hidden ===== */
  document.addEventListener('visibilitychange', () => {
    // three-scene.js, product-3d.js, explorer-3d.js check this flag
    window.__zeroPFAS_paused = document.hidden;
  });

  /* ===== WebGL availability check ===== */
  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  if (!hasWebGL()) {
    document.querySelectorAll('.product-hero__canvas-wrap, .explorer__canvas-wrap').forEach(wrap => {
      const loader = wrap.querySelector('.canvas-loader');
      if (loader) loader.classList.add('is-hidden');
      const fallback = document.createElement('div');
      fallback.className = 'webgl-fallback';
      fallback.innerHTML = '<div class="webgl-fallback__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg></div><p class="webgl-fallback__text">Tu navegador no soporta WebGL. Las visualizaciones 3D no están disponibles.</p>';
      wrap.appendChild(fallback);
    });
  }

})();
