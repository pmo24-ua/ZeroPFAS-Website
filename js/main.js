/* main.js — Interactions + scroll effects */
(function () {
  'use strict';

  /* ===== Navbar scroll ===== */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    lastScroll = window.scrollY;
  }, { passive: true });

  /* ===== Mobile toggle ===== */
  const toggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      toggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
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

  /* ===== Card spotlight follow cursor ===== */
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

  addSpotlight('.data-card');
  addSpotlight('.problem-card');
  addSpotlight('.tech-panel');
  addSpotlight('.verify-card');
  addSpotlight('.product-spec');
  addSpotlight('.product-fbar__item');

  /* ===== Glow separators animate on scroll ===== */
  const glowSeps = document.querySelectorAll('.glow-separator');
  const glowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.style.opacity = entry.isIntersecting ? '.4' : '.1';
    });
  }, { threshold: 0.5 });
  glowSeps.forEach(el => glowObserver.observe(el));

})();
