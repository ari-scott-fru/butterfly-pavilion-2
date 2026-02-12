// ==========================================================================
// Card Carousel Block - Infinite Loop
// ==========================================================================
import gsap from 'gsap';

export function initCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const pagination = carousel.querySelector('[data-carousel-pagination]');

    if (!track) return;

    // Get original cards before cloning
    const originalCards = Array.from(track.children);
    const totalCards = originalCards.length;

    if (totalCards === 0) return;

    // Clone cards for infinite loop effect
    // Append clones of first cards to the end
    // Prepend clones of last cards to the beginning
    const clonesPerSide = Math.min(totalCards, 3); // Clone up to 3 cards per side

    // Clone and append first cards to end
    for (let i = 0; i < clonesPerSide; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.setAttribute('data-clone', 'true');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }

    // Clone and prepend last cards to beginning
    for (let i = totalCards - 1; i >= totalCards - clonesPerSide; i--) {
      const clone = originalCards[i].cloneNode(true);
      clone.setAttribute('data-clone', 'true');
      clone.setAttribute('aria-hidden', 'true');
      track.insertBefore(clone, track.firstChild);
    }

    // Current index is offset by the prepended clones
    let currentIndex = clonesPerSide;
    let isTransitioning = false;

    // Get card width including gap
    const getCardWidth = () => {
      const card = track.children[0];
      if (!card) return 0;
      const style = window.getComputedStyle(track);
      const gap = parseInt(style.gap) || 24;
      return card.offsetWidth + gap;
    };

    // Create pagination dots (one per original card)
    const createPagination = () => {
      if (!pagination) return;

      pagination.innerHTML = '';
      for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('button');
        dot.className = 'card-carousel__dot';
        dot.setAttribute('aria-label', `Go to card ${i + 1}`);
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => goToCard(i + clonesPerSide));
        pagination.appendChild(dot);
      }
    };

    // Update pagination dots
    const updatePagination = () => {
      if (!pagination) return;

      // Calculate the actual card index (accounting for clones)
      let actualIndex = currentIndex - clonesPerSide;
      if (actualIndex < 0) actualIndex = totalCards + actualIndex;
      if (actualIndex >= totalCards) actualIndex = actualIndex - totalCards;

      const dots = pagination.querySelectorAll('.card-carousel__dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === actualIndex);
      });
    };

    // Slide track to show current card (with animation)
    const updateSlide = (animate = true) => {
      const cardWidth = getCardWidth();
      const offset = currentIndex * cardWidth;

      if (animate) {
        track.style.transition = 'transform 600ms ease';
      } else {
        track.style.transition = 'none';
      }

      track.style.transform = `translateX(-${offset}px)`;
    };

    // Reset all card opacities to 1
    const resetCardOpacities = () => {
      const allCards = Array.from(track.children);
      allCards.forEach(card => {
        gsap.set(card, { opacity: 1 });
      });
    };

    // Handle seamless loop jump after transition
    const handleTransitionEnd = () => {
      isTransitioning = false;

      // If we're on a clone, jump to the real card
      if (currentIndex < clonesPerSide) {
        // We're on a prepended clone, jump to end
        currentIndex = totalCards + currentIndex;
        updateSlide(false);
        resetCardOpacities();
      } else if (currentIndex >= totalCards + clonesPerSide) {
        // We're on an appended clone, jump to beginning
        currentIndex = currentIndex - totalCards;
        updateSlide(false);
        resetCardOpacities();
      }
    };

    track.addEventListener('transitionend', handleTransitionEnd);

    // Animate card entering/leaving the viewport edges
    const animateCardTransition = (direction, prevIndex) => {
      const allCards = Array.from(track.children);

      if (direction === 'next') {
        // Fade out the card leaving on the left
        const leavingCard = allCards[prevIndex];
        if (leavingCard) {
          gsap.to(leavingCard, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        }

        // Fade in the card entering on the right (estimate ~3 visible cards)
        const enteringCard = allCards[currentIndex + 3];
        if (enteringCard) {
          gsap.fromTo(enteringCard,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
        }
      } else {
        // Fade in the card entering on the left
        const enteringCard = allCards[currentIndex];
        if (enteringCard) {
          gsap.fromTo(enteringCard,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
        }

        // Fade out the card leaving on the right
        const leavingCard = allCards[prevIndex + 3];
        if (leavingCard) {
          gsap.to(leavingCard, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      }
    };

    // Go to specific card
    const goToCard = (index, direction = 'next') => {
      if (isTransitioning) return;
      isTransitioning = true;

      const prevIndex = currentIndex;
      currentIndex = index;
      updateSlide();
      updatePagination();
      animateCardTransition(direction, prevIndex);
    };

    // Navigation handlers
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        goToCard(currentIndex - 1, 'prev');
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        goToCard(currentIndex + 1, 'next');
      });
    }

    // Handle resize - recalculate slide position
    const handleResize = () => {
      updateSlide(false);
    };

    window.addEventListener('resize', handleResize);

    // Initialize
    createPagination();
    updateSlide(false);
  });
}
