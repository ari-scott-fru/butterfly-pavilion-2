// ==========================================================================
// Card Carousel Block - Marquee (continuous sliding)
// ==========================================================================

export function initCarousels() {
  const marquees = document.querySelectorAll('[data-marquee]');

  marquees.forEach(marquee => {
    const track = marquee.querySelector('[data-marquee-track]');
    if (!track) return;

    const cards = Array.from(track.children);
    if (cards.length === 0) return;

    // Clone all cards and append for seamless loop
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });
}
