/**
 * Testimonials Pagination
 *
 * Handles testimonial card pagination with smooth transitions.
 * WordPress Note: Can be enqueued conditionally when testimonials block is present.
 */

/**
 * Initialize testimonial pagination
 */
export function initTestimonials() {
  const testimonialBlocks = document.querySelectorAll('.testimonials');

  testimonialBlocks.forEach(block => {
    const cards = block.querySelectorAll('.testimonials__card');
    const dotsContainer = block.querySelector('.testimonials__dots');
    const prevBtn = block.querySelector('.testimonials__nav--prev');
    const nextBtn = block.querySelector('.testimonials__nav--next');

    if (cards.length === 0) return;

    let currentIndex = 0;
    const totalCards = cards.length;

    // Generate dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `testimonials__dot${index === 0 ? ' is-active' : ''}`;
        dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = block.querySelectorAll('.testimonials__dot');

    // Set initial state
    cards.forEach((card, index) => {
      if (index === 0) {
        card.classList.add('is-active');
      }
    });

    function updateButtons() {
      if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
      }
      if (nextBtn) {
        nextBtn.disabled = currentIndex === totalCards - 1;
      }
    }

    function goToSlide(index) {
      if (index === currentIndex || index < 0 || index >= totalCards) return;

      const prevIndex = currentIndex;
      currentIndex = index;

      // Update cards
      cards.forEach((card, i) => {
        card.classList.remove('is-active', 'is-prev');

        if (i === currentIndex) {
          card.classList.add('is-active');
        } else if (i === prevIndex) {
          card.classList.add('is-prev');
        }
      });

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentIndex);
      });

      updateButtons();
    }

    function nextSlide() {
      if (currentIndex < totalCards - 1) {
        goToSlide(currentIndex + 1);
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1);
      }
    }

    // Event listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }

    // Keyboard navigation
    block.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });

    // Optional: Auto-advance (uncomment if desired)
    // const autoplayInterval = 8000;
    // let autoplayTimer = setInterval(nextSlide, autoplayInterval);
    //
    // block.addEventListener('mouseenter', () => {
    //   clearInterval(autoplayTimer);
    // });
    //
    // block.addEventListener('mouseleave', () => {
    //   autoplayTimer = setInterval(nextSlide, autoplayInterval);
    // });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    block.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    block.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // Initial button state
    updateButtons();
  });
}
