/**
 * Scroll-Based Animations
 *
 * Uses GSAP ScrollTrigger for scroll-based animations.
 * Elements are animated based on data attributes for easy content management.
 *
 * WordPress Note: These animations can be enabled/disabled per-block
 * via ACF fields (e.g., enable_animation toggle).
 *
 * Data Attributes:
 * - data-animate="fade-in|fade-up|fade-left|fade-right|scale-in"
 * - data-animate-delay="100" (milliseconds)
 * - data-animate-duration="0.8" (seconds)
 * - data-animate-stagger="0.1" (for parent containers)
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animation presets
const animations = {
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  'fade-up': {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 }
  },
  'fade-down': {
    from: { opacity: 0, y: -40 },
    to: { opacity: 1, y: 0 }
  },
  'fade-left': {
    from: { opacity: 0, x: 40 },
    to: { opacity: 1, x: 0 }
  },
  'fade-right': {
    from: { opacity: 0, x: -40 },
    to: { opacity: 1, x: 0 }
  },
  'scale-in': {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 }
  },
  'blur-in': {
    from: { opacity: 0, filter: 'blur(10px)' },
    to: { opacity: 1, filter: 'blur(0px)' }
  },
  'rotate-in-left': {
    from: { opacity: 0, x: 100, rotation: 8 },
    to: { opacity: 1, x: 0, rotation: 0 }
  }
};

// Default options
const defaults = {
  duration: 0.8,
  ease: 'power2.out',
  start: 'top 85%',
  toggleActions: 'play none none none'
};

/**
 * Initialize scroll animations
 */
export function initScrollAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Remove animation attributes and show content immediately
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = 1;
    });
    return;
  }

  // Find all elements with data-animate attribute
  const animatedElements = document.querySelectorAll('[data-animate]');

  animatedElements.forEach(element => {
    const animationType = element.dataset.animate;
    const animation = animations[animationType];

    if (!animation) {
      console.warn(`Unknown animation type: ${animationType}`);
      return;
    }

    // Get custom options from data attributes
    const delay = parseFloat(element.dataset.animateDelay) / 1000 || 0;
    const duration = parseFloat(element.dataset.animateDuration) || defaults.duration;

    // Set initial state
    gsap.set(element, animation.from);

    // Create scroll trigger animation
    gsap.to(element, {
      ...animation.to,
      duration,
      delay,
      ease: defaults.ease,
      scrollTrigger: {
        trigger: element,
        start: defaults.start,
        toggleActions: defaults.toggleActions
      }
    });
  });

  // Handle staggered children animations
  initStaggerAnimations();

  // Handle image fade on scroll
  initImageFadeAnimations();

  // Handle butterfly fly-in animation
  initButterflyAnimation();
}

/**
 * Initialize staggered animations for container elements
 * Usage: <div data-animate-stagger="0.1"> with children having data-animate
 */
function initStaggerAnimations() {
  const staggerContainers = document.querySelectorAll('[data-animate-stagger]');

  staggerContainers.forEach(container => {
    const stagger = parseFloat(container.dataset.animateStagger) || 0.1;
    const children = container.querySelectorAll('[data-animate]');

    if (children.length === 0) return;

    // Get animation type from first child (assume all same)
    const animationType = children[0].dataset.animate;
    const animation = animations[animationType];

    if (!animation) return;

    // Set initial state for all children
    gsap.set(children, animation.from);

    // Create staggered animation
    gsap.to(children, {
      ...animation.to,
      duration: defaults.duration,
      stagger,
      ease: defaults.ease,
      scrollTrigger: {
        trigger: container,
        start: defaults.start,
        toggleActions: defaults.toggleActions
      }
    });
  });
}

/**
 * Initialize image fade animations on scroll
 * Usage: <div data-animate-image-fade> with multiple child images
 * Images will crossfade as user scrolls near the bottom of the section
 */
function initImageFadeAnimations() {
  const fadeContainers = document.querySelectorAll('[data-animate-image-fade]');

  fadeContainers.forEach(container => {
    const images = container.querySelectorAll('img');

    if (images.length < 2) return;

    // Get the parent section for scroll trigger bounds
    const section = container.closest('section');
    if (!section) return;

    const secondImage = images[1];

    // Crossfade images as you scroll through the section
    gsap.to(images[0], {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'center top',
        scrub: true
      }
    });

    gsap.to(secondImage, {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'center top',
        scrub: true
      }
    });
  });
}

/**
 * Initialize butterfly fly-in animation
 * Butterfly moves from right 25% to 40% on scroll when 3rd card comes into view
 */
function initButterflyAnimation() {
  const butterflies = document.querySelectorAll('.card-icons__butterfly');

  butterflies.forEach(butterfly => {
    const section = butterfly.closest('section');
    if (!section) return;

    // Target the grid to trigger when 3rd card is visible
    const grid = section.querySelector('.card-icons__grid');
    if (!grid) return;

    gsap.to(butterfly, {
      right: '40%',
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: grid,
        start: 'bottom 80%',
        toggleActions: 'play none none none'
      }
    });
  });
}

/**
 * Refresh ScrollTrigger after dynamic content loads
 * Call this after AJAX content loads or DOM changes
 */
export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

/**
 * Kill all scroll triggers (for cleanup/page transitions)
 */
export function killScrollAnimations() {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}
