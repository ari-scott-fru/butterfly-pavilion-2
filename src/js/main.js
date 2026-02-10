/**
 * Main JavaScript Entry Point
 *
 * This file initializes all JavaScript modules for the site.
 * WordPress Note: This can be split into smaller bundles for conditional loading.
 */

import { initScrollAnimations, refreshScrollTrigger } from './animations/scroll-animations.js';
import { initInteractiveAnimations, initParallax, initCounters } from './animations/interactive.js';
import { initCarousels } from './animations/carousel.js';
import { initTestimonials } from './animations/testimonials.js';

/**
 * Text Rotation Animation
 * Cycles through words with a fade effect
 */
function initTextRotate() {
  const elements = document.querySelectorAll('.text-rotate');

  elements.forEach(el => {
    const wordsAttr = el.dataset.rotateWords || el.dataset.rotate;
    if (!wordsAttr) return;

    // Support both comma-separated and JSON formats
    const words = wordsAttr.startsWith('[')
      ? JSON.parse(wordsAttr)
      : wordsAttr.split(',').map(w => w.trim());
    if (words.length === 0) return;

    let currentIndex = 0;
    let currentText = el.textContent;
    const typeSpeed = 80;
    const deleteSpeed = 50;
    const pauseBetweenWords = 4000;

    // Typewriter effect: delete then type
    function deleteText(callback) {
      if (currentText.length > 0) {
        currentText = currentText.slice(0, -1);
        el.textContent = currentText;
        setTimeout(() => deleteText(callback), deleteSpeed);
      } else {
        callback();
      }
    }

    function typeText(word, callback) {
      let charIndex = 0;
      function typeChar() {
        if (charIndex < word.length) {
          currentText = word.slice(0, charIndex + 1);
          el.textContent = currentText;
          charIndex++;
          setTimeout(typeChar, typeSpeed);
        } else {
          callback();
        }
      }
      typeChar();
    }

    function cycleWords() {
      setTimeout(() => {
        deleteText(() => {
          currentIndex = (currentIndex + 1) % words.length;
          typeText(words[currentIndex], cycleWords);
        });
      }, pauseBetweenWords);
    }

    // Start the cycle
    cycleWords();
  });
}

/**
 * Initialize all modules when DOM is ready
 */
function init() {
  // Initialize scroll-based animations
  initScrollAnimations();

  // Initialize interactive animations
  initInteractiveAnimations();

  // Initialize parallax effects (optional - comment out if not needed)
  initParallax();

  // Initialize counters if any exist
  initCounters();

  // Initialize text rotation
  initTextRotate();

  // Initialize carousels
  initCarousels();

  // Initialize testimonials pagination
  initTestimonials();

  console.log('🦋 Butterfly Pavilion initialized');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-initialize on window resize (for responsive changes)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    refreshScrollTrigger();
  }, 250);
});

// Export for use in other modules if needed
export { refreshScrollTrigger };
