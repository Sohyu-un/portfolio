// Manual, native-scroll carousel scoped to Design & development.
(() => {
  const carousel = document.querySelector('.cs-development-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.cs-development-track');
  const slides = [...track.querySelectorAll('.cs-development-slide')];
  const previous = carousel.querySelector('.cs-development-prev');
  const next = carousel.querySelector('.cs-development-next');
  const bars = [...carousel.querySelectorAll('.cs-development-progress button')];
  const status = carousel.querySelector('.cs-development-status');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  const position = i => Math.min(
    slides[i].offsetLeft - slides[0].offsetLeft,
    Math.max(0, track.scrollWidth - track.clientWidth)
  );
  const update = i => {
    index = i;
    previous.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    carousel.classList.toggle('is-at-end', i === slides.length - 1);
    bars.forEach((bar, j) => {
      if (j === i) bar.setAttribute('aria-current', 'true');
      else bar.removeAttribute('aria-current');
    });
    status.textContent = slides[i].querySelector('h3').textContent;
  };
  const go = (i, behavior = motion.matches ? 'instant' : 'smooth') => {
    const target = Math.max(0, Math.min(slides.length - 1, i));
    update(target);
    track.scrollTo({ left: position(target), behavior });
  };
  previous.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  bars.forEach((bar, i) => bar.addEventListener('click', () => go(i)));
  track.addEventListener('keydown', event => {
    const keys = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    go(keys[event.key]);
  });
  track.addEventListener('scroll', () => {
    const end = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft <= 1) update(0);
    else if (track.scrollLeft >= end - 1) update(slides.length - 1);
    else {
      const distances = slides.map((_, i) => Math.abs(position(i) - track.scrollLeft));
      update(distances.indexOf(Math.min(...distances)));
    }
  }, { passive: true });
  new ResizeObserver(() => go(index, 'instant')).observe(track);
  update(0);
})();
