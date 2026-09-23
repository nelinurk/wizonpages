(() => {
  'use strict';
  if (!document.body.classList.contains('wizon-home-experiment')) return;
  // A single small movement as icons enter view, never a continuous loop.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const iconObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-introduced');
        iconObserver.unobserve(entry.target);
      });
    }, {threshold: .6});
    document.querySelectorAll('.wizon-preview-service-icon').forEach(icon => iconObserver.observe(icon));
  }
  document.querySelectorAll('.wizon-testimonials__grid').forEach((grid, gridIndex) => {
    const cards = [...grid.querySelectorAll('.wizon-testimonials__card:not(.is-placeholder)')];
    if (cards.length < 2) return;
    let active = 0;
    const controls = document.createElement('div');
    controls.className = 'wizon-preview-slider';
    controls.setAttribute('aria-label', 'Kliendikommentaaride valik');
    const status = document.createElement('span');
    status.className = 'wizon-preview-slider__status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const dots = document.createElement('div');
    dots.className = 'wizon-preview-slider__dots';
    const arrows = document.createElement('div');
    arrows.className = 'wizon-preview-slider__arrows';
    cards.forEach((card, i) => {
      card.id = `wizon-preview-quote-${gridIndex}-${i}`;
      card.setAttribute('role', 'group');
      card.setAttribute('aria-label', `Kliendikommentaar ${i + 1}/${cards.length}`);
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Vaata kommentaari ${i + 1}`);
      dot.setAttribute('aria-controls', card.id);
      dot.addEventListener('click', () => show(i));
      dots.append(dot);
    });
    function show(index) {
      active = (index + cards.length) % cards.length;
      cards.forEach((card, i) => { card.hidden = i !== active; });
      [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
      status.textContent = `${active + 1} / ${cards.length}`;
    }
    [-1, 1].forEach((direction) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', direction < 0 ? 'Eelmine kommentaar' : 'Järgmine kommentaar');
      button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="${direction < 0 ? 'M20 12H4m7-7-7 7 7 7' : 'M4 12h16m-7-7 7 7-7 7'}"/></svg>`;
      button.addEventListener('click', () => show(active + direction));
      arrows.append(button);
    });
    controls.append(status, dots, arrows);
    grid.after(controls);
    const wrapper = document.createElement('div');
    wrapper.className = 'wizon-preview-testimonial-stage';
    grid.before(wrapper);
    wrapper.append(grid, controls);
    let start = null;
    grid.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) start = {x: event.touches[0].clientX, y: event.touches[0].clientY};
    }, {passive: true});
    grid.addEventListener('touchend', (event) => {
      if (!start || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(active + (dx < 0 ? 1 : -1));
      start = null;
    }, {passive: true});
    show(0);
  });
})();
