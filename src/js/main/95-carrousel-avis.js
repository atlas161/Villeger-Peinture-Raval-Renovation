/**
 * Carrousel d'avis (accueil et pages de service) : défilement en boucle par clonage de cartes,
 * nombre de cartes visibles selon la largeur, « Lire la suite » sur les avis longs.
 * Marquage : [data-reviews-carousel] > [data-reviews-track] > .review-card, boutons
 * [data-reviews-prev] / [data-reviews-next].
 */

const initReviewsCarousel = (carousel) => {
  if (carousel.dataset && carousel.dataset.reviewsInit === '1') return;

  const track = carousel.querySelector('[data-reviews-track]');
  const prev = carousel.querySelector('[data-reviews-prev]');
  const next = carousel.querySelector('[data-reviews-next]');
  if (!track) return;

  const baseCards = Array.from(track.querySelectorAll('.review-card:not([data-reviews-clone])'));
  if (baseCards.length === 0) return;

  const realCount = baseCards.length;
  const MAX_CLONES = 4;

  let index = 0;
  let looping = false;
  let cloneCount = 0;
  let ready = false;

  const getGap = () => {
    try {
      const gap = window.getComputedStyle(track).gap || '0px';
      const px = parseFloat(gap);
      return Number.isFinite(px) ? px : 0;
    } catch (_) {
      return 0;
    }
  };

  const getPerView = () => {
    const w = window.innerWidth || 0;
    if (w >= 1200) return 3;
    if (w >= 640) return 2;
    return 1;
  };

  const getCardWidth = () => {
    const card = track.querySelector('.review-card:not([data-reviews-clone])');
    if (!card) return 0;
    const rect = card.getBoundingClientRect();
    return rect && rect.width ? rect.width : card.offsetWidth || 0;
  };

  const isLayoutReady = () => {
    try {
      const trackStyle = window.getComputedStyle(track);
      if (trackStyle.display !== 'flex') return false;
      const card = track.querySelector('.review-card:not([data-reviews-clone])');
      if (!card) return false;
      const cardStyle = window.getComputedStyle(card);
      if (!cardStyle.flexBasis || cardStyle.flexBasis === 'auto') return false;
      const w = getCardWidth();
      return w > 40;
    } catch (_) {
      return false;
    }
  };

  const setTransitionEnabled = (enabled) => {
    track.style.transition = enabled ? '' : 'none';
  };

  const applyTransform = () => {
    const delta = (getCardWidth() + getGap()) * index;
    track.style.transform = `translate3d(${-delta}px, 0, 0)`;
  };

  const setButtonsState = () => {
    if (!prev && !next) return;

    const perView = getPerView();
    const canLoop = realCount > perView;

    if (canLoop) {
      if (prev) prev.disabled = false;
      if (next) next.disabled = false;
      return;
    }

    const maxIndex = Math.max(0, realCount - perView);
    index = Math.max(0, Math.min(index, maxIndex));
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= maxIndex;
  };

  const removeClones = () => {
    const clones = Array.from(track.querySelectorAll('[data-reviews-clone]'));
    clones.forEach((el) => el.remove());
  };

  const refreshReadMore = () => {
    const cards = Array.from(track.querySelectorAll('.review-card'));
    if (cards.length === 0) return;

    const updateOverflow = (card) => {
      const text = card.querySelector('.review-text');
      const btn = card.querySelector('[data-review-more]');
      if (!text || !btn) return;

      const wasExpanded = card.classList.contains('is-expanded');
      card.classList.remove('is-expanded');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Lire la suite';

      requestAnimationFrame(() => {
        const overflows = text.scrollHeight - text.clientHeight > 1;
        card.classList.toggle('has-overflow', overflows);
        if (wasExpanded && overflows) {
          card.classList.add('is-expanded');
          btn.setAttribute('aria-expanded', 'true');
          btn.textContent = 'Réduire';
        }
      });
    };

    cards.forEach((card) => {
      const btn = card.querySelector('[data-review-more]');
      if (!btn) return;
      if (btn.__vprrBound) return;
      btn.__vprrBound = true;

      btn.addEventListener('click', () => {
        const expanded = !card.classList.contains('is-expanded');
        card.classList.toggle('is-expanded', expanded);
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        btn.textContent = expanded ? 'Réduire' : 'Lire la suite';
      });

      updateOverflow(card);
    });
  };

  const ensureLooping = () => {
    const perView = getPerView();
    const canLoop = realCount > perView;

    if (!canLoop) {
      if (looping) {
        removeClones();
        looping = false;
        cloneCount = 0;
        index = 0;
        setTransitionEnabled(false);
        applyTransform();
        track.getBoundingClientRect();
        setTransitionEnabled(true);
      }
      setButtonsState();
      refreshReadMore();
      return;
    }

    if (looping) {
      setButtonsState();
      refreshReadMore();
      return;
    }

    removeClones();
    cloneCount = Math.min(MAX_CLONES, realCount);
    const cards = Array.from(track.querySelectorAll('.review-card:not([data-reviews-clone])'));
    const prefix = cards.slice(-cloneCount).map((c) => {
      const clone = c.cloneNode(true);
      clone.setAttribute('data-reviews-clone', '');
      return clone;
    });
    const suffix = cards.slice(0, cloneCount).map((c) => {
      const clone = c.cloneNode(true);
      clone.setAttribute('data-reviews-clone', '');
      return clone;
    });

    prefix.reverse().forEach((c) => track.insertBefore(c, track.firstChild));
    suffix.forEach((c) => track.appendChild(c));

    looping = true;
    index = cloneCount;

    setTransitionEnabled(false);
    applyTransform();
    track.getBoundingClientRect();
    setTransitionEnabled(true);
    setButtonsState();
    refreshReadMore();
  };

  const move = (dir) => {
    index += dir;
    applyTransform();
    setButtonsState();
  };

  const normalizeLoopPosition = () => {
    if (!looping) return;

    if (index < cloneCount) {
      index = index + realCount;
      setTransitionEnabled(false);
      applyTransform();
      track.getBoundingClientRect();
      setTransitionEnabled(true);
      return;
    }

    if (index >= cloneCount + realCount) {
      index = index - realCount;
      setTransitionEnabled(false);
      applyTransform();
      track.getBoundingClientRect();
      setTransitionEnabled(true);
    }
  };

  if (!track.__vprrReviewsBound) {
    track.__vprrReviewsBound = true;
    track.addEventListener('transitionend', (e) => {
      if (e && e.propertyName && e.propertyName !== 'transform') return;
      normalizeLoopPosition();
    });
  }

  if (prev && !prev.__vprrBound) {
    prev.__vprrBound = true;
    prev.addEventListener('click', () => move(-1));
  }
  if (next && !next.__vprrBound) {
    next.__vprrBound = true;
    next.addEventListener('click', () => move(1));
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!ready) return;
      if (looping) {
        const realIndex = ((index - cloneCount) % realCount + realCount) % realCount;
        index = cloneCount + realIndex;
        setTransitionEnabled(false);
        applyTransform();
        track.getBoundingClientRect();
        setTransitionEnabled(true);
        setButtonsState();
        refreshReadMore();
        return;
      }

      setTransitionEnabled(false);
      setButtonsState();
      applyTransform();
      track.getBoundingClientRect();
      setTransitionEnabled(true);
      refreshReadMore();
    }, 120);
  }, { passive: true });

  const initWhenReady = (attempt = 0) => {
    if (ready) return;
    if (isLayoutReady()) {
      ready = true;
      if (carousel.dataset) carousel.dataset.reviewsInit = '1';
      ensureLooping();
      setTransitionEnabled(false);
      applyTransform();
      track.getBoundingClientRect();
      setTransitionEnabled(true);
      refreshReadMore();
      return;
    }

    if (attempt > 90) {
      ready = true;
      if (carousel.dataset) carousel.dataset.reviewsInit = '1';
      setButtonsState();
      refreshReadMore();
      return;
    }

    requestAnimationFrame(() => initWhenReady(attempt + 1));
  };

  initWhenReady();
};

const initReviewsCarousels = () => {
  Array.from(document.querySelectorAll('[data-reviews-carousel]')).forEach(initReviewsCarousel);
};
