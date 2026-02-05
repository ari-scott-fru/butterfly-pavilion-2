/**
 * Interactive Animations
 *
 * GSAP animations triggered by user interactions (hover, click, etc.)
 * These are typically used for UI elements like buttons, cards, menus.
 *
 * WordPress Note: These can be conditionally loaded based on theme settings.
 */

import gsap from 'gsap';

/**
 * Initialize all interactive animations
 */
export function initInteractiveAnimations() {
  initButtonHover();
  initCardHover();
  initMobileMenuToggle();
}

/**
 * Enhanced button hover effects
 */
function initButtonHover() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
  });
}

/**
 * Card hover effects with slight lift
 */
function initCardHover() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const image = card.querySelector('.card__image');

    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: 'power2.out'
      });

      if (image) {
        gsap.to(image, {
          scale: 1.05,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        duration: 0.3,
        ease: 'power2.out'
      });

      if (image) {
        gsap.to(image, {
          scale: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });
  });
}

/**
 * Mobile menu toggle animation
 */
function initMobileMenuToggle() {
  const toggle = document.querySelector('.site-header__toggle');
  const nav = document.querySelector('.site-header__nav');

  if (!toggle || !nav) return;

  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    toggle.setAttribute('aria-expanded', isOpen);

    const bars = toggle.querySelectorAll('.site-header__toggle-bar');

    if (isOpen) {
      // Animate to X
      gsap.to(bars[0], {
        y: 7,
        rotation: 45,
        duration: 0.3,
        ease: 'power2.inOut'
      });
      gsap.to(bars[1], {
        opacity: 0,
        duration: 0.2
      });
      gsap.to(bars[2], {
        y: -7,
        rotation: -45,
        duration: 0.3,
        ease: 'power2.inOut'
      });

      // Show nav (you'd add mobile nav styles)
      nav.classList.add('is-open');
    } else {
      // Animate back to hamburger
      gsap.to(bars[0], {
        y: 0,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });
      gsap.to(bars[1], {
        opacity: 1,
        duration: 0.2
      });
      gsap.to(bars[2], {
        y: 0,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });

      nav.classList.remove('is-open');
    }
  });
}

/**
 * Parallax effect for hero backgrounds
 * @param {string} selector - CSS selector for parallax elements
 * @param {number} speed - Parallax speed (0.1 - 0.5 recommended)
 */
export function initParallax(selector = '.hero__background-image', speed = 0.3) {
  const elements = document.querySelectorAll(selector);

  if (elements.length === 0) return;

  // Use matchMedia to check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  elements.forEach(element => {
    gsap.to(element, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element.closest('section') || element.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

/**
 * Counter animation for statistics
 * @param {string} selector - CSS selector for counter elements
 */
export function initCounters(selector = '[data-counter]') {
  const counters = document.querySelectorAll(selector);

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.counter, 10);
    const suffix = counter.dataset.counterSuffix || '';
    const duration = parseFloat(counter.dataset.counterDuration) || 2;

    const obj = { value: 0 };

    gsap.to(obj, {
      value: target,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counter,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      onUpdate: () => {
        counter.textContent = Math.round(obj.value).toLocaleString() + suffix;
      }
    });
  });
}
